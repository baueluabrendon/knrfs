import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RefinanceStatistics {
  totalInternalRefinances: number;
  totalExternalRefinances: number;
  refinancesByEmployerType: {
    publicServants: number;
    statutoryBody: number;
    company: number;
  };
}

export const useRefinanceStatistics = () => {
  return useQuery({
    queryKey: ['refinance-statistics'],
    queryFn: async (): Promise<RefinanceStatistics> => {
      try {
        // Get internal refinances (applications with type 'refinance')
        const { data: internalRefinances, error: internalError } = await supabase
          .from('applications')
          .select('application_id, jsonb_data')
          .eq('application_type', 'refinance')
          .eq('status', 'approved');

        if (internalError) throw internalError;

        // Get external refinances (loans with refinanced_by field populated but not from internal applications)
        const { data: externalRefinances, error: externalError } = await supabase
          .from('loans')
          .select('loan_id, refinanced_by, client__type')
          .not('refinanced_by', 'is', null)
          .neq('refinanced_by', 'Null');

        if (externalError) throw externalError;

        // Filter external refinances (those not from internal applications)
        const internalLoanIds = new Set(
          internalRefinances?.map(app => app.application_id) || []
        );
        
        const actualExternalRefinances = externalRefinances?.filter(
          loan => !internalLoanIds.has(loan.refinanced_by)
        ) || [];

        // Calculate statistics by employer type for internal refinances
        const employerTypeStats = {
          publicServants: 0,
          statutoryBody: 0,
          company: 0
        };

        internalRefinances?.forEach(app => {
          try {
            const jsonData = app.jsonb_data as any;
            const employmentDetails = jsonData?.employmentDetails;
            if (employmentDetails?.company) {
              const companyName = (employmentDetails.company as string).toLowerCase();
              if (companyName.includes('government') || companyName.includes('public service')) {
                employerTypeStats.publicServants++;
              } else if (companyName.includes('statutory') || companyName.includes('board') || companyName.includes('authority')) {
                employerTypeStats.statutoryBody++;
              } else {
                employerTypeStats.company++;
              }
            } else {
              employerTypeStats.company++; // Default to company if no employer info
            }
          } catch (error) {
            console.warn('Error parsing application data:', error);
            employerTypeStats.company++; // Default to company if parsing fails
          }
        });

        return {
          totalInternalRefinances: internalRefinances?.length || 0,
          totalExternalRefinances: actualExternalRefinances.length,
          refinancesByEmployerType: employerTypeStats
        };

      } catch (error) {
        console.error('Error fetching refinance statistics:', error);
        return {
          totalInternalRefinances: 0,
          totalExternalRefinances: 0,
          refinancesByEmployerType: {
            publicServants: 0,
            statutoryBody: 0,
            company: 0
          }
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};