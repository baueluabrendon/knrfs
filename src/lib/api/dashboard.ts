
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
    console.log(`Fetching loan vs repayments for year: ${year}, month: ${month}, timeFrame: ${timeFrame}`);

    // If a month is selected, we're viewing weekly data
    if (month !== undefined) {
      // Fetch raw data from the database
      const { data: disbursements, error: disbursementsError } = await supabase
        .from('loan_disbursement_view')
        .select('*')
        .eq('time_frame', 'daily') // Use daily data to aggregate into weeks
        .eq('year', year)
        .order('period_start', { ascending: true });
      
      if (disbursementsError) {
        console.error('Error fetching disbursements:', disbursementsError);
        throw disbursementsError;
      }

      const { data: repayments, error: repaymentsError } = await supabase
        .from('repayment_collection_view')
        .select('*')
        .eq('time_frame', 'daily') // Use daily data to aggregate into weeks
        .eq('year', year)
        .order('period_start', { ascending: true });

      if (repaymentsError) {
        console.error('Error fetching repayments:', repaymentsError);
        throw repaymentsError;
      }

      console.log('Raw disbursements data:', disbursements);
      console.log('Raw repayments data:', repayments);

      // Generate weekly periods for the specified month
      const startDate = new Date(year, month - 1, 1); // month is 0-indexed in JS Date
      const endDate = endOfMonth(startDate);
      
      // Find the first Monday of the month (or the 1st if it's a Monday)
      let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 1 });
      
      // If the first week starts before the month, adjust to the 1st
      if (currentWeekStart.getMonth() !== month - 1) {
        currentWeekStart = startDate;
      }
      
      const weeklyPeriods: TimeSeriesData[] = [];
      let weekNum = 1;
      
      while (currentWeekStart <= endDate) {
        const currentWeekEnd = new Date(Math.min(endOfWeek(currentWeekStart, { weekStartsOn: 1 }).getTime(), endDate.getTime()));
        
        // Create the weekly period
        weeklyPeriods.push({
          period_start: currentWeekStart.toISOString(),
          period_end: currentWeekEnd.toISOString(),
          time_frame: 'weekly',
          year,
          period_num: weekNum,
          total_principal: 0,
          actual_amount: 0
        });
        
        // Move to next week
        currentWeekStart = addDays(currentWeekEnd, 1);
        weekNum++;
      }

      // Aggregate daily data into weekly periods
      return weeklyPeriods.map(weekPeriod => {
        const weekStart = new Date(weekPeriod.period_start);
        const weekEnd = new Date(weekPeriod.period_end);
        
        // Filter and sum disbursements
        const weekDisbursements = disbursements?.filter(d => {
          const date = new Date(d.period_start);
          return date >= weekStart && date <= weekEnd;
        }) || [];
        
        // Filter and sum repayments
        const weekRepayments = repayments?.filter(r => {
          const date = new Date(r.period_start);
          return date >= weekStart && date <= weekEnd;
        }) || [];
        
        const totalPrincipal = weekDisbursements.reduce((sum, item) => sum + (Number(item.total_principal) || 0), 0);
        const actualAmount = weekRepayments.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);
        
        return {
          ...weekPeriod,
          total_principal: totalPrincipal,
          actual_amount: actualAmount
        };
      });
    } else {
      // Monthly view - use existing logic
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

      // Create array of all periods (months)
      const periodsCount = 12;
      const allPeriods = Array.from({ length: periodsCount }, (_, i) => {
        const date = new Date(year, i, 1);
        return {
          period_start: date.toISOString(),
          period_end: endOfMonth(date).toISOString(),
          time_frame: timeFrame,
          year,
          period_num: i + 1,
          total_principal: 0,
          actual_amount: 0
        };
      });

      return allPeriods.map(period => {
        const monthStart = new Date(period.period_start);
        const monthNum = monthStart.getMonth();
        
        const disbursement = disbursements?.find(d => new Date(d.period_start).getMonth() === monthNum);
        const repayment = repayments?.find(r => new Date(r.period_start).getMonth() === monthNum);

        return {
          ...period,
          total_principal: disbursement?.total_principal || 0,
          actual_amount: repayment?.total_amount || 0
        };
      });
    }
  },

  async getRepaymentComparison({ year, month, timeFrame }: { year: number; month?: number; timeFrame: string }): Promise<TimeSeriesData[]> {
    console.log(`Fetching repayment comparison for year: ${year}, month: ${month}, timeFrame: ${timeFrame}`);

    // If a month is selected, we're viewing weekly data
    if (month !== undefined) {
      const { data, error } = await supabase
        .from('repayment_comparison_view')
        .select('*')
        .eq('time_frame', 'daily') // Use daily data to aggregate into weeks
        .eq('year', year)
        .order('period_start', { ascending: true });
      
      if (error) {
        console.error('Error fetching repayment comparison data:', error);
        throw error;
      }

      console.log('Raw repayment comparison data:', data);

      // Generate weekly periods for the specified month
      const startDate = new Date(year, month - 1, 1); // month is 0-indexed in JS Date
      const endDate = endOfMonth(startDate);
      
      // Find the first Monday of the month (or the 1st if it's a Monday)
      let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 1 });
      
      // If the first week starts before the month, adjust to the 1st
      if (currentWeekStart.getMonth() !== month - 1) {
        currentWeekStart = startDate;
      }
      
      const weeklyPeriods: TimeSeriesData[] = [];
      let weekNum = 1;
      
      while (currentWeekStart <= endDate) {
        const currentWeekEnd = new Date(Math.min(endOfWeek(currentWeekStart, { weekStartsOn: 1 }).getTime(), endDate.getTime()));
        
        // Create the weekly period
        weeklyPeriods.push({
          period_start: currentWeekStart.toISOString(),
          period_end: currentWeekEnd.toISOString(),
          time_frame: 'weekly',
          year,
          period_num: weekNum,
          scheduled_amount: 0,
          actual_amount: 0
        });
        
        // Move to next week
        currentWeekStart = addDays(currentWeekEnd, 1);
        weekNum++;
      }

      // Aggregate daily data into weekly periods
      return weeklyPeriods.map(weekPeriod => {
        const weekStart = new Date(weekPeriod.period_start);
        const weekEnd = new Date(weekPeriod.period_end);
        
        // Filter and sum data for this week
        const weekData = data?.filter(d => {
          const date = new Date(d.period_start);
          return date >= weekStart && date <= weekEnd;
        }) || [];
        
        const scheduledAmount = weekData.reduce((sum, item) => sum + (Number(item.scheduled_amount) || 0), 0);
        const actualAmount = weekData.reduce((sum, item) => sum + (Number(item.actual_amount) || 0), 0);
        
        return {
          ...weekPeriod,
          scheduled_amount: scheduledAmount,
          actual_amount: actualAmount
        };
      });
    } else {
      // Monthly view - use existing logic
      const { data, error } = await supabase
        .from('repayment_comparison_view')
        .select('*')
        .eq('time_frame', timeFrame)
        .eq('year', year)
        .order('period_start', { ascending: true });
      
      if (error) throw error;

      // Create array of all periods (months)
      const periodsCount = 12;
      const allPeriods = Array.from({ length: periodsCount }, (_, i) => {
        const date = new Date(year, i, 1);
        return {
          period_start: date.toISOString(),
          period_end: endOfMonth(date).toISOString(),
          time_frame: timeFrame,
          year,
          period_num: i + 1,
          scheduled_amount: 0,
          actual_amount: 0
        };
      });

      return allPeriods.map(period => {
        const monthStart = new Date(period.period_start);
        const monthNum = monthStart.getMonth();
        
        const comparison = data?.find(d => new Date(d.period_start).getMonth() === monthNum);

        return {
          ...period,
          scheduled_amount: comparison?.scheduled_amount || 0,
          actual_amount: comparison?.actual_amount || 0
        };
      });
    }
  }
};
