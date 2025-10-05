
import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  active_loans_count: number;
  active_borrowers_count: number;
  at_risk_loans_count: number;
  pending_applications_count: number;
  total_principal_amount: number;
  total_outstanding_balance: number;
  total_repayments_amount: number;
  avg_loan_duration_days: number;
  settled_loans_count: number;
  total_arrears_amount: number;
  total_default_fees: number;
  loans_with_missed_payments: number;
  loans_with_partial_payments: number;
  collection_efficiency_percentage: number;
  total_collections_this_year: number;
  total_new_borrowers_this_year: number;
  total_public_servants: number;
  total_statutory_body: number;
  total_private_company: number;
  refinanced_internal: number;
  refinanced_external: number;
}

export const dashboardApi = {
  async getDashboardMetrics(branchId?: string, userRole?: string): Promise<DashboardMetrics> {
    try {
      // Fetch real-time loan data
      let loansQuery = supabase
        .from('loans')
        .select(`
          loan_status,
          outstanding_balance,
          principal,
          total_repayment,
          missed_payments_count,
          partial_payments_count,
          arrears,
          default_fees_accumulated,
          borrower_id,
          refinanced,
          borrowers!inner(branch_id, client_type)
        `);

      if (branchId) {
        loansQuery = loansQuery.eq('borrowers.branch_id', branchId);
      }

      const { data: loansData, error: loansError } = await loansQuery;
      if (loansError) throw loansError;

      // Fetch aggregated data from view for current year
      const currentYear = new Date().getFullYear();
      let analyticsQuery = supabase
        .from('dashboard_analytics_with_branches')
        .select('*')
        .eq('year', currentYear);

      if (branchId) {
        analyticsQuery = analyticsQuery.eq('branch_id', branchId);
      }

      const { data: analyticsData, error: analyticsError } = await analyticsQuery;
      if (analyticsError) console.error('Analytics error:', analyticsError);

      // Calculate real-time metrics from loans table
      const activeLoans = loansData?.filter(loan => loan.loan_status === 'active') || [];
      const settledLoans = loansData?.filter(loan => loan.loan_status === 'settled') || [];
      
      // Get active borrower IDs (distinct)
      const activeBorrowerIds = new Set(activeLoans.map(l => l.borrower_id));
      
      // Real-time loan metrics
      const realTimeMetrics = {
        active_loans_count: activeLoans.length,
        settled_loans_count: settledLoans.length,
        total_outstanding_balance: activeLoans.reduce((sum, loan) => sum + (loan.outstanding_balance || 0), 0),
        total_principal_amount: loansData?.reduce((sum, loan) => sum + (loan.principal || 0), 0) || 0,
        total_repayments_amount: loansData?.reduce((sum, loan) => sum + (loan.total_repayment || 0), 0) || 0,
        total_arrears_amount: loansData?.reduce((sum, loan) => sum + (loan.arrears || 0), 0) || 0,
        total_default_fees: loansData?.reduce((sum, loan) => sum + (loan.default_fees_accumulated || 0), 0) || 0,
        loans_with_missed_payments: loansData?.filter(loan => (loan.missed_payments_count || 0) > 0).length || 0,
        loans_with_partial_payments: loansData?.filter(loan => (loan.partial_payments_count || 0) > 0).length || 0,
        refinanced_internal: loansData?.filter(l => l.refinanced === 'Internal').length || 0,
        refinanced_external: loansData?.filter(l => l.refinanced === 'External').length || 0,
      };

      // Aggregate analytics metrics for the year
      const totalCollectionsThisYear = analyticsData?.reduce((sum, item) => 
        sum + (Number(item.total_collections) || 0), 0) || 0;
      
      const totalNewBorrowersThisYear = analyticsData?.reduce((sum, item) => 
        sum + (Number(item.new_borrowers_count) || 0), 0) || 0;

      // Fetch all borrowers to get actual client type counts for active borrowers
      let borrowersQuery = supabase
        .from('borrowers')
        .select('borrower_id, client_type');

      if (branchId) {
        borrowersQuery = borrowersQuery.eq('branch_id', branchId);
      }

      const { data: allBorrowers } = await borrowersQuery;
      
      // Filter to only count active borrowers
      const activeBorrowersData = allBorrowers?.filter(b => 
        activeBorrowerIds.has(b.borrower_id)
      ) || [];

      const clientTypeCounts = activeBorrowersData.reduce((acc, borrower) => {
        const type = borrower.client_type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get at-risk and pending applications from analytics
      const atRiskCount = analyticsData?.reduce((sum, item) => 
        sum + (Number(item.at_risk_loans_count) || 0), 0) || 0;
      
      const pendingAppsCount = analyticsData?.reduce((sum, item) => 
        sum + (Number(item.pending_applications_count) || 0), 0) || 0;

      const avgDuration = analyticsData && analyticsData.length > 0
        ? Math.round(analyticsData.reduce((sum, item) => sum + (item.avg_loan_duration_days || 0), 0) / analyticsData.length)
        : 0;

      const collectionEfficiency = realTimeMetrics.total_principal_amount > 0
        ? (realTimeMetrics.total_repayments_amount / realTimeMetrics.total_principal_amount) * 100
        : 0;

      return {
        ...realTimeMetrics,
        active_borrowers_count: activeBorrowerIds.size,
        at_risk_loans_count: atRiskCount,
        pending_applications_count: pendingAppsCount,
        avg_loan_duration_days: avgDuration,
        collection_efficiency_percentage: collectionEfficiency,
        total_collections_this_year: totalCollectionsThisYear,
        total_new_borrowers_this_year: totalNewBorrowersThisYear,
        total_public_servants: clientTypeCounts['Public Service'] || 0,
        total_statutory_body: clientTypeCounts['Statutory Body'] || 0,
        total_private_company: clientTypeCounts['Private Company'] || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }
};
