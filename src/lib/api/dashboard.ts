
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
}

export const dashboardApi = {
  async getDashboardMetrics(branchId?: string, userRole?: string) {
    try {
      // Get real-time loan counts from loans table
      const isAdmin = userRole && ['administrator', 'super user'].includes(userRole);
      
      // Real-time loan counts query
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
          borrowers!inner(branch_id)
        `);

      // Apply branch filtering for real-time data
      if (!isAdmin && branchId) {
        loansQuery = loansQuery.eq('borrowers.branch_id', branchId);
      }

      const { data: loansData, error: loansError } = await loansQuery;
      if (loansError) throw loansError;

      // Get analytics data for trends and other metrics
      let analyticsQuery = supabase.from('dashboard_analytics_with_branches').select('*');
      
      // Apply branch filter for analytics data
      if (!isAdmin && branchId) {
        analyticsQuery = analyticsQuery.eq('branch_id', branchId);
      }
      
      const { data: analyticsData, error: analyticsError } = await analyticsQuery;
      if (analyticsError) throw analyticsError;

      // Calculate real-time metrics from loans table
      const activeLoans = loansData?.filter(loan => loan.loan_status === 'active') || [];
      const settledLoans = loansData?.filter(loan => loan.loan_status === 'settled') || [];
      const overdueLoans = loansData?.filter(loan => loan.loan_status === 'overdue') || [];
      
      // Real-time loan counts
      const realTimeMetrics = {
        active_loans_count: activeLoans.length,
        settled_loans_count: settledLoans.length,
        overdue_loans_count: overdueLoans.length,
        total_outstanding_balance: activeLoans.reduce((sum, loan) => sum + (loan.outstanding_balance || 0), 0),
        total_principal_amount: loansData?.reduce((sum, loan) => sum + (loan.principal || 0), 0) || 0,
        total_repayments_amount: loansData?.reduce((sum, loan) => sum + (loan.total_repayment || 0), 0) || 0,
        total_arrears_amount: loansData?.reduce((sum, loan) => sum + (loan.arrears || 0), 0) || 0,
        total_default_fees: loansData?.reduce((sum, loan) => sum + (loan.default_fees_accumulated || 0), 0) || 0,
        loans_with_missed_payments: loansData?.filter(loan => (loan.missed_payments_count || 0) > 0).length || 0,
        loans_with_partial_payments: loansData?.filter(loan => (loan.partial_payments_count || 0) > 0).length || 0,
      };

      // Get analytics data for trending metrics
      let analyticsMetrics = {
        active_borrowers_count: 0,
        at_risk_loans_count: 0,
        pending_applications_count: 0,
        avg_loan_duration_days: 0,
        collection_efficiency_percentage: 0
      };

      if (Array.isArray(analyticsData) && analyticsData.length > 0) {
        // Aggregate analytics data across branches
        analyticsMetrics = analyticsData.reduce((acc, curr) => ({
          active_borrowers_count: (acc.active_borrowers_count || 0) + 
            (curr.public_service_count || 0) + (curr.statutory_body_count || 0) + (curr.private_company_count || 0),
          at_risk_loans_count: (acc.at_risk_loans_count || 0) + (curr.at_risk_loans_count || 0),
          pending_applications_count: (acc.pending_applications_count || 0) + (curr.pending_applications_count || 0),
          avg_loan_duration_days: Math.round(((acc.avg_loan_duration_days || 0) + (curr.avg_loan_duration_days || 0)) / 2),
          collection_efficiency_percentage: Math.round(((acc.collection_efficiency_percentage || 0) + (curr.collection_efficiency_percentage || 0)) / 2)
        }), analyticsMetrics);
      } else if (analyticsData && analyticsData.length > 0) {
        const data = analyticsData[0];
        analyticsMetrics = {
          active_borrowers_count: (data.public_service_count || 0) + (data.statutory_body_count || 0) + (data.private_company_count || 0),
          at_risk_loans_count: data.at_risk_loans_count || 0,
          pending_applications_count: data.pending_applications_count || 0,
          avg_loan_duration_days: data.avg_loan_duration_days || 0,
          collection_efficiency_percentage: data.collection_efficiency_percentage || 0
        };
      }

      // Combine real-time and analytics data
      return {
        ...realTimeMetrics,
        ...analyticsMetrics
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }
};
