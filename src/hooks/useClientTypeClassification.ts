import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClientTypeStats {
  clientType: string;
  count: number;
  totalOutstanding: number;
  collectionSchedule: 'weekly' | 'fortnightly';
}

export function useClientTypeClassification() {
  return useQuery({
    queryKey: ['clientTypeClassification'],
    queryFn: async (): Promise<ClientTypeStats[]> => {
      // Get borrowers with their client types and associated loan data
      const { data: borrowersData, error } = await supabase
        .from('borrowers')
        .select(`
          client_type,
          loans!inner(
            outstanding_balance,
            loan_status,
            repayment_schedule!inner(
              payroll_type
            )
          )
        `)
        .not('client_type', 'is', null);

      if (error) {
        console.error('Error fetching client type classification:', error);
        throw error;
      }

      // Process data to get statistics by client type
      const clientTypeMap = new Map<string, {
        count: number;
        totalOutstanding: number;
        payrollTypes: string[];
      }>();

      borrowersData?.forEach((borrower) => {
        const clientType = borrower.client_type || 'unclassified';
        
        if (!clientTypeMap.has(clientType)) {
          clientTypeMap.set(clientType, {
            count: 0,
            totalOutstanding: 0,
            payrollTypes: []
          });
        }

        const stats = clientTypeMap.get(clientType)!;
        stats.count += 1;

        // Sum outstanding balances from active loans
        borrower.loans?.forEach((loan: any) => {
          if (loan.loan_status === 'active') {
            stats.totalOutstanding += loan.outstanding_balance || 0;
            
            // Collect payroll types for collection scheduling
            loan.repayment_schedule?.forEach((schedule: any) => {
              if (schedule.payroll_type && !stats.payrollTypes.includes(schedule.payroll_type)) {
                stats.payrollTypes.push(schedule.payroll_type);
              }
            });
          }
        });
      });

      // Convert to result format
      return Array.from(clientTypeMap.entries()).map(([clientType, stats]) => ({
        clientType,
        count: stats.count,
        totalOutstanding: stats.totalOutstanding,
        collectionSchedule: determineCollectionSchedule(clientType, stats.payrollTypes)
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

function determineCollectionSchedule(
  clientType: string, 
  payrollTypes: string[]
): 'weekly' | 'fortnightly' {
  // Public service and statutory bodies typically have fortnightly pay cycles
  if (clientType === 'public' || clientType === 'statutory') {
    return 'fortnightly';
  }
  
  // Companies may vary, but default to fortnightly for consistency
  // This can be customized based on actual payroll data
  return 'fortnightly';
}