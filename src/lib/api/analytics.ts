import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  period_label: string;
  principal_released: number;
  total_collections: number;
  total_due_amount: number;
  total_outstanding: number;
  doc_fees_collected: number;
  risk_insurance_collected: number;
  default_fees_collected: number;
  loans_released_count: number;
  active_loans_count: number;
  repayments_collected_count: number;
  settled_loans_count: number;
  new_borrowers_count: number;
  male_count: number;
  female_count: number;
  public_service_count: number;
  statutory_body_count: number;
  private_company_count: number;
  defaults_count: number;
  public_defaults: number;
  statutory_defaults: number;
  private_defaults: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface LoanStatusData {
  loan_status: string;
  loan_repayment_status: string;
  count: number;
}

export const analyticsApi = {
  // Get analytics data for charts based on time period
  async getAnalyticsData(
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsData[]> {
    const start = startDate || '2024-01-01';
    const end = endDate || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase.rpc('get_dashboard_analytics', {
      p_start_date: start,
      p_end_date: end,
      p_period_type: period
    });

    if (error) throw error;
    return data || [];
  },

  // Get loan status breakdown for pie chart
  async getLoanStatusBreakdown(): Promise<LoanStatusData[]> {
    const { data, error } = await supabase
      .from('loans')
      .select('loan_status, loan_repayment_status')
      .eq('loan_status', 'active');

    if (error) throw error;

    // Group by repayment status
    const statusCounts = (data || []).reduce((acc: Record<string, number>, loan) => {
      const status = loan.loan_repayment_status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      loan_status: 'active',
      loan_repayment_status: status,
      count: count as number
    }));
  },

  // Get gender distribution for pie chart
  async getGenderDistribution(): Promise<PieChartData[]> {
    const { data, error } = await supabase
      .from('borrowers')
      .select('gender')
      .not('gender', 'is', null);

    if (error) throw error;

    const genderCounts = (data || []).reduce((acc: Record<string, number>, borrower) => {
      const gender = borrower.gender || 'Unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(genderCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(genderCounts).map(([gender, count]) => ({
      name: gender,
      value: Math.round((count / total) * 100),
      color: gender === 'Male' ? '#3B82F6' : '#EC4899'
    }));
  },

  // Get clients per company breakdown
  async getClientsPerCompany(): Promise<PieChartData[]> {
    const { data, error } = await supabase
      .from('borrowers')
      .select('department_company')
      .not('department_company', 'is', null);

    if (error) throw error;

    const companyCounts = (data || []).reduce((acc: Record<string, number>, borrower) => {
      const company = borrower.department_company?.toLowerCase() || '';
      
      let category = 'Private Companies';
      if (company.includes('public') || company.includes('government')) {
        category = 'Public Service';
      } else if (company.includes('statutory') || company.includes('authority')) {
        category = 'Statutory Bodies';
      }
      
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(companyCounts).reduce((sum, count) => sum + count, 0);

    const colors = {
      'Public Service': '#10B981',
      'Statutory Bodies': '#6366F1',
      'Private Companies': '#F59E0B'
    };

    return Object.entries(companyCounts).map(([category, count]) => ({
      name: category,
      value: Math.round((count / total) * 100),
      color: colors[category as keyof typeof colors]
    }));
  },

  // Get defaults per company breakdown
  async getDefaultsPerCompany(): Promise<PieChartData[]> {
    const { data, error } = await supabase
      .from('defaults')
      .select(`
        *,
        repayment_schedule!inner(
          loan_id,
          loans!inner(
            borrower_id,
            borrowers!inner(department_company)
          )
        )
      `);

    if (error) throw error;

    const defaultCounts = (data || []).reduce((acc: Record<string, number>, defaultRecord) => {
      const company = defaultRecord.repayment_schedule?.loans?.borrowers?.department_company?.toLowerCase() || '';
      
      let category = 'Private Companies';
      if (company.includes('public') || company.includes('government')) {
        category = 'Public Service';
      } else if (company.includes('statutory') || company.includes('authority')) {
        category = 'Statutory Bodies';
      }
      
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(defaultCounts).reduce((sum, count) => sum + count, 0);

    const colors = {
      'Public Service': '#EF4444',
      'Statutory Bodies': '#DC2626', 
      'Private Companies': '#991B1B'
    };

    return Object.entries(defaultCounts).map(([category, count]) => ({
      name: category,
      value: Math.round((count / total) * 100),
      color: colors[category as keyof typeof colors]
    }));
  },

  // Get loan status pie chart data
  async getLoanStatusPieChart(): Promise<PieChartData[]> {
    const statusData = await this.getLoanStatusBreakdown();
    
    const statusColors = {
      'on time': '#22C55E',
      'due today': '#F59E0B', 
      'overdue': '#EF4444',
      'partial': '#F97316',
      'default': '#DC2626',
      'paid': '#10B981'
    };

    const total = statusData.reduce((sum, item) => sum + item.count, 0);

    return statusData.map(item => ({
      name: item.loan_repayment_status === 'on time' ? 'Loans on Schedule' :
            item.loan_repayment_status === 'partial' ? 'Partial Repayments' :
            item.loan_repayment_status === 'default' ? 'Loans in Arrears' :
            item.loan_repayment_status === 'paid' ? 'Fully Paid' :
            item.loan_repayment_status,
      value: Math.round((item.count / total) * 100),
      color: statusColors[item.loan_repayment_status as keyof typeof statusColors] || '#6B7280'
    }));
  }
};