import { supabase } from '@/integrations/supabase/client';

export interface TimeSeriesData {
  time_frame: string;
  year: number;
  period_num: number;
  period_start: string;
  period_end: string;
  total_principal?: number;
  total_amount?: number;
  scheduled_amount?: number;
  actual_amount?: number;
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
    return data;
  },

  async getLoanVsRepayments({ year, month, timeFrame }: { year: number; month?: number; timeFrame: string }): Promise<TimeSeriesData[]> {
    const { data: disbursements, error: disbursementsError } = await supabase
      .from('loan_disbursement_view')
      .select('*')
      .eq('time_frame', timeFrame)
      .eq('year', year)
      .order('period_start', { ascending: true });
    
    if (disbursementsError) throw disbursementsError;

    const { data: repayments, error: repaymentsError } = await supabase
      .from('repayment_collection_view')
      .select('*')
      .eq('time_frame', timeFrame)
      .eq('year', year)
      .order('period_start', { ascending: true });

    if (repaymentsError) throw repaymentsError;

    // Create array of all periods
    const periodsCount = timeFrame === 'weekly' ? 4 : 12;
    const allPeriods = Array.from({ length: periodsCount }, (_, i) => {
      const date = new Date(year, month || 0, month ? i * 7 + 1 : i + 1);
      return {
        period_start: date.toISOString(),
        period_end: timeFrame === 'weekly' 
          ? new Date(year, month || 0, (i + 1) * 7).toISOString()
          : new Date(year, (i + 1), 0).toISOString(),
        time_frame: timeFrame,
        year,
        period_num: i + 1,
        total_principal: 0,
        actual_amount: 0
      };
    });

    return allPeriods.map(period => {
      const disbursement = disbursements?.find(d => 
        new Date(d.period_start).getTime() === new Date(period.period_start).getTime()
      );
      const repayment = repayments?.find(r => 
        new Date(r.period_start).getTime() === new Date(period.period_start).getTime()
      );

      return {
        ...period,
        total_principal: disbursement?.total_principal || 0,
        actual_amount: repayment?.total_amount || 0
      };
    });
  },

  async getRepaymentComparison({ year, month, timeFrame }: { year: number; month?: number; timeFrame: string }): Promise<TimeSeriesData[]> {
    const { data, error } = await supabase
      .from('repayment_comparison_view')
      .select('*')
      .eq('time_frame', timeFrame)
      .eq('year', year)
      .order('period_start', { ascending: true });
    
    if (error) throw error;

    // Create array of all periods
    const periodsCount = timeFrame === 'weekly' ? 4 : 12;
    const allPeriods = Array.from({ length: periodsCount }, (_, i) => {
      const date = new Date(year, month || 0, month ? i * 7 + 1 : i + 1);
      return {
        period_start: date.toISOString(),
        period_end: timeFrame === 'weekly' 
          ? new Date(year, month || 0, (i + 1) * 7).toISOString()
          : new Date(year, (i + 1), 0).toISOString(),
        time_frame: timeFrame,
        year,
        period_num: i + 1,
        scheduled_amount: 0,
        actual_amount: 0
      };
    });

    return allPeriods.map(period => {
      const comparison = data?.find(d => 
        new Date(d.period_start).getTime() === new Date(period.period_start).getTime()
      );

      return {
        ...period,
        scheduled_amount: comparison?.scheduled_amount || 0,
        actual_amount: comparison?.actual_amount || 0
      };
    });
  }
};
