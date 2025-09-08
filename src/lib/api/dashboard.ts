
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
      let query = supabase.from('dashboard_analytics_with_branches').select('*');
      
      // Apply branch filter based on user role
      if (branchId && userRole && !['administrator', 'super user'].includes(userRole)) {
        // Non-admin users see only their branch data
        query = query.eq('branch_id', branchId);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      
      // Aggregate the metrics if we have multiple rows (from multiple branches)
      if (Array.isArray(data) && data.length > 0) {
        // Sum up all numeric fields across branches
        const aggregated = data.reduce((acc, curr) => ({
          active_loans_count: (acc.active_loans_count || 0) + (curr.active_loans_count || 0),
          active_borrowers_count: (acc.active_borrowers_count || 0) + (curr.public_service_count || 0) + (curr.statutory_body_count || 0) + (curr.private_company_count || 0),
          at_risk_loans_count: (acc.at_risk_loans_count || 0) + (curr.at_risk_loans_count || 0),
          pending_applications_count: (acc.pending_applications_count || 0) + (curr.pending_applications_count || 0),
          total_principal_amount: (acc.total_principal_amount || 0) + (curr.principal_released || 0),
          total_outstanding_balance: (acc.total_outstanding_balance || 0) + (curr.total_outstanding || 0),
          total_repayments_amount: (acc.total_repayments_amount || 0) + (curr.total_collections || 0),
          avg_loan_duration_days: Math.round(((acc.avg_loan_duration_days || 0) + (curr.avg_loan_duration_days || 0)) / 2),
          settled_loans_count: (acc.settled_loans_count || 0) + (curr.settled_loans_count || 0),
          total_arrears_amount: (acc.total_arrears_amount || 0) + (curr.total_arrears || 0),
          total_default_fees: (acc.total_default_fees || 0) + (curr.total_default_amount || 0),
          loans_with_missed_payments: (acc.loans_with_missed_payments || 0) + (curr.total_missed_payments || 0),
          loans_with_partial_payments: (acc.loans_with_partial_payments || 0) + (curr.total_partial_payments || 0),
          collection_efficiency_percentage: Math.round(((acc.collection_efficiency_percentage || 0) + (curr.collection_efficiency_percentage || 0)) / 2)
        }), {
          active_loans_count: 0,
          active_borrowers_count: 0,
          at_risk_loans_count: 0,
          pending_applications_count: 0,
          total_principal_amount: 0,
          total_outstanding_balance: 0,
          total_repayments_amount: 0,
          avg_loan_duration_days: 0,
          settled_loans_count: 0,
          total_arrears_amount: 0,
          total_default_fees: 0,
          loans_with_missed_payments: 0,
          loans_with_partial_payments: 0,
          collection_efficiency_percentage: 0
        });
        
        return aggregated;
      }
      
      return data && data.length > 0 ? {
        active_loans_count: data[0].active_loans_count || 0,
        active_borrowers_count: (data[0].public_service_count || 0) + (data[0].statutory_body_count || 0) + (data[0].private_company_count || 0),
        at_risk_loans_count: data[0].at_risk_loans_count || 0,
        pending_applications_count: data[0].pending_applications_count || 0,
        total_principal_amount: data[0].principal_released || 0,
        total_outstanding_balance: data[0].total_outstanding || 0,
        total_repayments_amount: data[0].total_collections || 0,
        avg_loan_duration_days: data[0].avg_loan_duration_days || 0,
        settled_loans_count: data[0].settled_loans_count || 0,
        total_arrears_amount: data[0].total_arrears || 0,
        total_default_fees: data[0].total_default_amount || 0,
        loans_with_missed_payments: data[0].total_missed_payments || 0,
        loans_with_partial_payments: data[0].total_partial_payments || 0,
        collection_efficiency_percentage: data[0].collection_efficiency_percentage || 0
      } : {
        active_loans_count: 0,
        active_borrowers_count: 0,
        at_risk_loans_count: 0,
        pending_applications_count: 0,
        total_principal_amount: 0,
        total_outstanding_balance: 0,
        total_repayments_amount: 0,
        avg_loan_duration_days: 0,
        settled_loans_count: 0,
        total_arrears_amount: 0,
        total_default_fees: 0,
        loans_with_missed_payments: 0,
        loans_with_partial_payments: 0,
        collection_efficiency_percentage: 0
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }
};
