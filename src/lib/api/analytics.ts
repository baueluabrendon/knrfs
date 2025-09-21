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
  // Get real-time analytics data directly from source tables
  async getAnalyticsData(
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
    startDate?: string,
    endDate?: string,
    branchId?: string,
    clientType?: string,
    userRole?: string
  ): Promise<any[]> {
    const start = startDate || '2024-01-01';
    const end = endDate || new Date().toISOString().split('T')[0];
    
    // Build branch filter condition for joins
    const isAdmin = userRole && ['administrator', 'super user'].includes(userRole);
    let branchCondition = '';
    
    if (!isAdmin && branchId) {
      branchCondition = `AND borrowers.branch_id = '${branchId}'`;
    } else if (branchId && branchId !== 'all') {
      branchCondition = `AND borrowers.branch_id = '${branchId}'`;
    }

    // Get loan disbursements (loans released) by period
    const { data: loanData, error: loanError } = await supabase.rpc('get_dashboard_analytics', {
      p_start_date: start,
      p_end_date: end,
      p_period_type: period
    });

    if (loanError) throw loanError;

    // Get real-time outstanding balances
    let outstandingQuery = supabase
      .from('loans')
      .select('outstanding_balance, disbursement_date, borrower_id, borrowers!inner(branch_id)')
      .eq('loan_status', 'active');

    if (!isAdmin && branchId) {
      outstandingQuery = outstandingQuery.eq('borrowers.branch_id', branchId);
    } else if (branchId && branchId !== 'all') {
      outstandingQuery = outstandingQuery.eq('borrowers.branch_id', branchId);
    }

    const { data: outstandingData, error: outstandingError } = await outstandingQuery;
    if (outstandingError) throw outstandingError;

    // Get fee collections from repayment_schedule
    let feeCollectionsQuery = supabase
      .from('repayment_schedule')
      .select(`
        settled_date,
        received_documentation_fee,
        received_loan_risk_insurance,
        received_gst_amount,
        default_charged,
        loans!inner(borrower_id, borrowers!inner(branch_id))
      `)
      .not('settled_date', 'is', null)
      .gte('settled_date', start)
      .lte('settled_date', end);

    if (!isAdmin && branchId) {
      feeCollectionsQuery = feeCollectionsQuery.eq('loans.borrowers.branch_id', branchId);
    } else if (branchId && branchId !== 'all') {
      feeCollectionsQuery = feeCollectionsQuery.eq('loans.borrowers.branch_id', branchId);
    }

    const { data: feeData, error: feeError } = await feeCollectionsQuery;
    if (feeError) throw feeError;

    // Get repayment collections
    let repaymentsQuery = supabase
      .from('repayments')
      .select(`
        payment_date,
        amount,
        loan_id,
        loans!inner(borrower_id, borrowers!inner(branch_id))
      `)
      .gte('payment_date', start)
      .lte('payment_date', end);

    if (!isAdmin && branchId) {
      repaymentsQuery = repaymentsQuery.eq('loans.borrowers.branch_id', branchId);
    } else if (branchId && branchId !== 'all') {
      repaymentsQuery = repaymentsQuery.eq('loans.borrowers.branch_id', branchId);
    }

    const { data: repaymentData, error: repaymentError } = await repaymentsQuery;
    if (repaymentError) throw repaymentError;

    return loanData || [];
  },

  // Get aggregated analytics data with real-time calculations
  async getAggregatedAnalyticsData(
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
    startDate?: string,
    endDate?: string,
    branchId?: string,
    clientType?: string,
    userRole?: string
  ): Promise<any[]> {
    const start = startDate || '2024-01-01';
    const end = endDate || new Date().toISOString().split('T')[0];
    const isAdmin = userRole && ['administrator', 'super user'].includes(userRole);

    // Get data from database function (handles period aggregation)
    const { data: analyticsData, error: analyticsError } = await supabase.rpc('get_dashboard_analytics', {
      p_start_date: start,
      p_end_date: end,
      p_period_type: period
    });

    if (analyticsError) throw analyticsError;

    // Get real-time outstanding balances for active loans
    let outstandingQuery = supabase
      .from('loans')
      .select('outstanding_balance, disbursement_date, borrower_id, borrowers!inner(branch_id)')
      .eq('loan_status', 'active');

    if (!isAdmin && branchId) {
      outstandingQuery = outstandingQuery.eq('borrowers.branch_id', branchId);
    } else if (branchId && branchId !== 'all') {
      outstandingQuery = outstandingQuery.eq('borrowers.branch_id', branchId);
    }

    const { data: outstandingData } = await outstandingQuery;
    const totalOutstanding = outstandingData?.reduce((sum, loan) => sum + (loan.outstanding_balance || 0), 0) || 0;

    // Get real-time fee collections from repayment_schedule
    let feeQuery = supabase
      .from('repayment_schedule')
      .select(`
        settled_date,
        received_documentation_fee,
        received_loan_risk_insurance,
        received_gst_amount,
        default_charged,
        loans!inner(borrower_id, borrowers!inner(branch_id))
      `)
      .not('settled_date', 'is', null)
      .gte('settled_date', start)
      .lte('settled_date', end);

    if (!isAdmin && branchId) {
      feeQuery = feeQuery.eq('loans.borrowers.branch_id', branchId);
    } else if (branchId && branchId !== 'all') {
      feeQuery = feeQuery.eq('loans.borrowers.branch_id', branchId);
    }

    const { data: feeData } = await feeQuery;

    // Get real-time repayment collections
    let repaymentQuery = supabase
      .from('repayments')
      .select(`
        payment_date,
        amount,
        loans!inner(borrower_id, borrowers!inner(branch_id))
      `)
      .gte('payment_date', start)
      .lte('payment_date', end);

    if (!isAdmin && branchId) {
      repaymentQuery = repaymentQuery.eq('loans.borrowers.branch_id', branchId);
    } else if (branchId && branchId !== 'all') {
      repaymentQuery = repaymentQuery.eq('loans.borrowers.branch_id', branchId);
    }

    const { data: repaymentData } = await repaymentQuery;

    // Process analytics data and add real-time calculations
    const processedData = (analyticsData || []).map((row: any) => {
      // Calculate period-specific outstanding balance (for chart display)
      const periodOutstanding = period === 'monthly' ? totalOutstanding : row.total_outstanding;
      
      // Get fee collections for this period from repayment_schedule
      const periodFeeData = feeData?.filter(fee => {
        const feeDate = new Date(fee.settled_date);
        const rowPeriod = row.period_label;
        
        if (period === 'monthly') {
          const feeMonth = `${feeDate.getFullYear()}-${String(feeDate.getMonth() + 1).padStart(2, '0')}`;
          return rowPeriod.includes(feeMonth);
        }
        return true; // For other periods, include all
      }) || [];

      const docFeesCollected = periodFeeData.reduce((sum, fee) => sum + (fee.received_documentation_fee || 0), 0);
      const riskInsuranceCollected = periodFeeData.reduce((sum, fee) => sum + (fee.received_loan_risk_insurance || 0), 0);
      const defaultFeesCollected = periodFeeData.reduce((sum, fee) => sum + (fee.default_charged || 0), 0);

      // Get repayment collections for this period
      const periodRepayments = repaymentData?.filter(rep => {
        const repDate = new Date(rep.payment_date);
        const rowPeriod = row.period_label;
        
        if (period === 'monthly') {
          const repMonth = `${repDate.getFullYear()}-${String(repDate.getMonth() + 1).padStart(2, '0')}`;
          return rowPeriod.includes(repMonth);
        }
        return true;
      }) || [];

      const totalCollections = periodRepayments.reduce((sum, rep) => sum + (rep.amount || 0), 0);
      const repaymentsCollectedCount = periodRepayments.length;

      return {
        ...row,
        total_outstanding: periodOutstanding,
        doc_fees_collected: docFeesCollected,
        risk_insurance_collected: riskInsuranceCollected,
        default_fees_collected: defaultFeesCollected,
        total_collections: totalCollections,
        repayments_collected_count: repaymentsCollectedCount
      };
    });

    // Sort by period (oldest first for 12-month display)
    return processedData.sort((a, b) => a.period_label.localeCompare(b.period_label));
  },

  // Get loan status breakdown for pie chart with branch filtering
  async getLoanStatusBreakdown(branchId?: string, userRole?: string): Promise<LoanStatusData[]> {
    const isAdmin = userRole && ['administrator', 'super user'].includes(userRole);
    
    let query = supabase
      .from('loans')
      .select('loan_status, loan_repayment_status, borrower_id, borrowers!inner(branch_id)')
      .eq('loan_status', 'active');

    // Apply branch filtering
    if (!isAdmin && branchId) {
      query = query.eq('borrowers.branch_id', branchId);
    } else if (branchId && branchId !== 'all') {
      query = query.eq('borrowers.branch_id', branchId);
    }

    const { data, error } = await query;
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

  // Get gender distribution for pie chart with branch filtering
  async getGenderDistribution(branchId?: string, userRole?: string): Promise<PieChartData[]> {
    const isAdmin = userRole && ['administrator', 'super user'].includes(userRole);
    
    let query = supabase
      .from('borrowers')
      .select('gender, branch_id')
      .not('gender', 'is', null);

    // Apply branch filtering
    if (!isAdmin && branchId) {
      query = query.eq('branch_id', branchId);
    } else if (branchId && branchId !== 'all') {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
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

  // Get clients per company breakdown with branch filtering
  async getClientsPerCompany(branchId?: string, userRole?: string): Promise<PieChartData[]> {
    const isAdmin = userRole && ['administrator', 'super user'].includes(userRole);
    
    let query = supabase
      .from('borrowers')
      .select('department_company, branch_id')
      .not('department_company', 'is', null);

    // Apply branch filtering
    if (!isAdmin && branchId) {
      query = query.eq('branch_id', branchId);
    } else if (branchId && branchId !== 'all') {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
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

  // Get defaults per company breakdown with branch filtering
  async getDefaultsPerCompany(branchId?: string, userRole?: string): Promise<PieChartData[]> {
    const isAdmin = userRole && ['administrator', 'super user'].includes(userRole);
    
    let query = supabase
      .from('defaults')
      .select(`
        *,
        repayment_schedule!inner(
          loan_id,
          loans!inner(
            borrower_id,
            borrowers!inner(department_company, branch_id)
          )
        )
      `);

    const { data, error } = await query;
    if (error) throw error;

    // Filter by branch if needed
    const filteredData = (data || []).filter(defaultRecord => {
      const branchIdFromRecord = defaultRecord.repayment_schedule?.loans?.borrowers?.branch_id;
      
      if (!isAdmin && branchId) {
        return branchIdFromRecord === branchId;
      } else if (branchId && branchId !== 'all') {
        return branchIdFromRecord === branchId;
      }
      return true;
    });

    const defaultCounts = filteredData.reduce((acc: Record<string, number>, defaultRecord) => {
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

  // Get loan status pie chart data with branch filtering
  async getLoanStatusPieChart(branchId?: string, userRole?: string): Promise<PieChartData[]> {
    const statusData = await this.getLoanStatusBreakdown(branchId, userRole);
    
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