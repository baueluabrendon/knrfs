
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, addDays, addWeeks, startOfMonth, endOfMonth, format } from 'date-fns';

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
  total_arrears?: number;
  interest_received?: number;
  interest_scheduled?: number;
  total_disbursed?: number;
  total_repaid?: number;
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

  async getLoanVsRepayments({ year, month, timeFrame, payrollType }: { 
    year: number; 
    month?: number; 
    timeFrame: string;
    payrollType?: string;
  }): Promise<TimeSeriesData[]> {
    let query = supabase
      .from('loan_vs_repayment_comparison_view')
      .select('*')
      .eq('time_frame', timeFrame);

    if (payrollType) {
      query = query.eq('payroll_type', payrollType);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching loan vs repayment data:', error);
      throw error;
    }

    console.log('Raw loan vs repayment data:', data);
    return data || [];
  },

  async getRepaymentComparison({ year, month, timeFrame, payrollType }: { 
    year: number; 
    month?: number; 
    timeFrame: string;
    payrollType?: string;
  }): Promise<TimeSeriesData[]> {
    let query = supabase
      .from('repayment_collections_view')
      .select('*')
      .eq('time_frame', timeFrame);

    if (payrollType) {
      query = query.eq('payroll_type', payrollType);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching repayment comparison data:', error);
      throw error;
    }

    console.log('Raw repayment comparison data:', data);
    return data || [];
  },

  async getArrearsData({ year, month, timeFrame, payrollType }: { 
    year: number; 
    month?: number; 
    timeFrame: string;
    payrollType?: string;
  }): Promise<TimeSeriesData[]> {
    let query = supabase
      .from('arrears_summary_view')
      .select('*')
      .eq('time_frame', timeFrame);

    if (payrollType) {
      query = query.eq('payroll_type', payrollType);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching arrears data:', error);
      throw error;
    }

    console.log('Raw arrears data:', data);
    return data || [];
  },

  async getInterestComparison({ year, month, timeFrame, payrollType }: { 
    year: number; 
    month?: number; 
    timeFrame: string;
    payrollType?: string;
  }): Promise<TimeSeriesData[]> {
    let query = supabase
      .from('interest_comparison_view')
      .select('*')
      .eq('time_frame', timeFrame);

    if (payrollType) {
      query = query.eq('payroll_type', payrollType);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching interest comparison data:', error);
      throw error;
    }

    console.log('Raw interest comparison data:', data);
    return data || [];
  }
};
