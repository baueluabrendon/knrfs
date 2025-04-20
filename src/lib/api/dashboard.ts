
import { supabase } from '@/integrations/supabase/client';

export interface TimeSeriesData {
  time_frame: string;
  year: number;
  period_num: number;
  period_start: string;
  period_end: string;
  total_amount?: number;
  total_principal?: number;
}

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

export const dashboardApi = {
  async getMetrics(): Promise<DashboardMetrics> {
    const { data, error } = await supabase
      .from('dashboard_metrics_view')
      .select('*')
      .single();
    
    if (error) throw error;
    return data as DashboardMetrics;
  },

  async getLoanDisbursements(year: number): Promise<TimeSeriesData[]> {
    const { data: disbursements, error: disbursementsError } = await supabase
      .from('loan_disbursement_view')
      .select('*')
      .eq('time_frame', 'monthly')
      .eq('year', year)
      .order('period_start', { ascending: true });
    
    if (disbursementsError) throw disbursementsError;

    const { data: repayments, error: repaymentsError } = await supabase
      .from('repayment_collection_view')
      .select('*')
      .eq('time_frame', 'monthly')
      .eq('year', year)
      .order('period_start', { ascending: true });

    if (repaymentsError) throw repaymentsError;

    // Create array of all months
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(year, i, 1);
      return {
        period_start: date.toISOString(),
        period_end: new Date(year, i + 1, 0).toISOString(),
        time_frame: 'monthly',
        year,
        period_num: i + 1,
        total_principal: 0,
        total_amount: 0
      };
    });

    // Merge actual data with the full month array
    return allMonths.map(month => {
      const disbursement = disbursements?.find(d => 
        new Date(d.period_start).getMonth() === new Date(month.period_start).getMonth()
      );
      const repayment = repayments?.find(r => 
        new Date(r.period_start).getMonth() === new Date(month.period_start).getMonth()
      );

      return {
        ...month,
        total_principal: disbursement?.total_principal || 0,
        total_amount: repayment?.total_amount || 0
      };
    });
  }
};
