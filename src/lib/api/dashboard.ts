
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
}

export interface TimeSeriesData {
  time_frame: string;
  year: number;
  period_num: number;
  period_start: string;
  period_end: string;
  total_amount?: number;
  scheduled_amount?: number;
  actual_amount?: number;
  total_principal?: number;
  total_gross?: number;
}

export const dashboardApi = {
  async getMetrics(): Promise<DashboardMetrics> {
    const { data, error } = await supabase
      .from('dashboard_metrics_view')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async getLoanDisbursements(timeFrame: string): Promise<TimeSeriesData[]> {
    const { data, error } = await supabase
      .from('loan_disbursement_view')
      .select('*')
      .eq('time_frame', timeFrame)
      .order('period_start', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getRepaymentComparison(timeFrame: string): Promise<TimeSeriesData[]> {
    const { data, error } = await supabase
      .from('repayment_comparison_view')
      .select('*')
      .eq('time_frame', timeFrame)
      .order('period_start', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};
