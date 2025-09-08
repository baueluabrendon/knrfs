import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  analysis_date: string;
  year: number;
  month: number;
  day: number;
  week: number;
  quarter: number;
  // Branch information
  branch_id: string;
  branch_name: string;
  branch_code: string;
  client_type: string;
  payroll_type: string;
  // Loan disbursement metrics
  loans_released_count: number;
  principal_released: number;
  total_loan_amount: number;
  // Collection metrics
  total_collections: number;
  repayments_collected_count: number;
  pending_collections: number;
  interest_collected: number;
  doc_fees_collected: number;
  risk_insurance_collected: number;
  gst_collected: number;
  // Schedule metrics
  total_due_amount: number;
  repayments_due_count: number;
  principal_due: number;
  interest_due: number;
  doc_fees_due: number;
  risk_insurance_due: number;
  gst_due: number;
  pending_schedules: number;
  paid_schedules: number;
  partial_schedules: number;
  defaulted_schedules: number;
  // Portfolio metrics
  active_loans_count: number;
  settled_loans_count: number;
  at_risk_loans_count: number;
  overdue_loans_count: number;
  total_outstanding: number;
  total_arrears: number;
  total_default_fees: number;
  total_missed_payments: number;
  total_partial_payments: number;
  avg_completion_percentage: number;
  // Default metrics
  defaults_count: number;
  total_default_amount: number;
  public_defaults: number;
  statutory_defaults: number;
  private_defaults: number;
  public_default_amount: number;
  statutory_default_amount: number;
  private_default_amount: number;
  // Borrower metrics
  new_borrowers_count: number;
  new_male_borrowers: number;
  new_female_borrowers: number;
  new_public_service: number;
  new_statutory_body: number;
  new_private_company: number;
  // Gender distribution
  male_count: number;
  female_count: number;
  // Client type distribution
  public_service_count: number;
  statutory_body_count: number;
  private_company_count: number;
  // Application metrics
  total_applications: number;
  pending_applications_count: number;
  approved_applications_count: number;
  declined_applications_count: number;
  // Efficiency metrics
  collection_efficiency_percentage: number;
  avg_loan_duration_days: number;
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
  // Get analytics data from the comprehensive view with branch filtering
  async getAnalyticsData(
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
    startDate?: string,
    endDate?: string,
    branchId?: string,
    clientType?: string,
    userRole?: string
  ): Promise<AnalyticsData[]> {
    const start = startDate || '2024-01-01';
    const end = endDate || new Date().toISOString().split('T')[0];
    
    let query = supabase
      .from('dashboard_analytics_with_branches')
      .select('*')
      .gte('analysis_date', start)
      .lte('analysis_date', end)
      .order('analysis_date', { ascending: false });

    // Apply branch filter based on user role
    if (branchId && branchId !== 'all') {
      // If user is not admin/super user, filter by their branch
      if (userRole && !['administrator', 'super user'].includes(userRole)) {
        query = query.eq('branch_id', branchId);
      } else if (branchId) {
        // Admin can filter by specific branch if provided
        query = query.eq('branch_id', branchId);
      }
    } else if (userRole && !['administrator', 'super user'].includes(userRole) && branchId) {
      // Non-admin users always see only their branch data
      query = query.eq('branch_id', branchId);
    }

    // Apply client type filter if provided
    if (clientType && clientType !== 'all') {
      query = query.eq('client_type', clientType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Get aggregated analytics data grouped by time period
  async getAggregatedAnalyticsData(
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
    startDate?: string,
    endDate?: string,
    branchId?: string,
    clientType?: string,
    userRole?: string
  ): Promise<any[]> {
    const rawData = await this.getAnalyticsData(period, startDate, endDate, branchId, clientType, userRole);
    
    // Group by time period and aggregate
    const groupedData = rawData.reduce((acc: any, row) => {
      let periodKey: string;
      
      switch (period) {
        case 'daily':
          periodKey = `${row.year}-${String(row.month).padStart(2, '0')}-${String(row.day).padStart(2, '0')}`;
          break;
        case 'weekly':
          periodKey = `${row.year}-W${String(row.week).padStart(2, '0')}`;
          break;
        case 'monthly':
          periodKey = `${row.year}-${String(row.month).padStart(2, '0')}`;
          break;
        case 'quarterly':
          periodKey = `${row.year}-Q${row.quarter}`;
          break;
        case 'yearly':
          periodKey = String(row.year);
          break;
        default:
          periodKey = `${row.year}-${String(row.month).padStart(2, '0')}`;
      }

      if (!acc[periodKey]) {
        acc[periodKey] = {
          period_label: periodKey,
          principal_released: 0,
          total_collections: 0,
          total_due_amount: 0,
          total_outstanding: 0,
          doc_fees_collected: 0,
          risk_insurance_collected: 0,
          loans_released_count: 0,
          active_loans_count: 0,
          repayments_collected_count: 0,
          settled_loans_count: 0,
          new_borrowers_count: 0,
          male_count: 0,
          female_count: 0,
          public_service_count: 0,
          statutory_body_count: 0,
          private_company_count: 0,
          defaults_count: 0,
          public_defaults: 0,
          statutory_defaults: 0,
          private_defaults: 0
        };
      }

      // Aggregate the metrics
      acc[periodKey].principal_released += row.principal_released || 0;
      acc[periodKey].total_collections += row.total_collections || 0;
      acc[periodKey].total_due_amount += row.total_due_amount || 0;
      acc[periodKey].total_outstanding += row.total_outstanding || 0;
      acc[periodKey].doc_fees_collected += row.doc_fees_collected || 0;
      acc[periodKey].risk_insurance_collected += row.risk_insurance_collected || 0;
      acc[periodKey].loans_released_count += row.loans_released_count || 0;
      acc[periodKey].active_loans_count += row.active_loans_count || 0;
      acc[periodKey].repayments_collected_count += row.repayments_collected_count || 0;
      acc[periodKey].settled_loans_count += row.settled_loans_count || 0;
      acc[periodKey].new_borrowers_count += row.new_borrowers_count || 0;
      acc[periodKey].male_count += row.male_count || 0;
      acc[periodKey].female_count += row.female_count || 0;
      acc[periodKey].public_service_count += row.public_service_count || 0;
      acc[periodKey].statutory_body_count += row.statutory_body_count || 0;
      acc[periodKey].private_company_count += row.private_company_count || 0;
      acc[periodKey].defaults_count += row.defaults_count || 0;
      acc[periodKey].public_defaults += row.public_defaults || 0;
      acc[periodKey].statutory_defaults += row.statutory_defaults || 0;
      acc[periodKey].private_defaults += row.private_defaults || 0;

      return acc;
    }, {});

    return Object.values(groupedData);
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