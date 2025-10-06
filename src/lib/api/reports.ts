import { supabase } from "@/integrations/supabase/client";

// =====================================================
// REPORTS API - Comprehensive Reporting System
// =====================================================

export interface UsersReportFilters {
  startDate?: string;
  endDate?: string;
  role?: string;
  branchId?: string;
}

export interface BorrowersReportFilters {
  year?: string;
  organizationName?: string;
}

export interface ApplicationsReportFilters {
  year: string;
  status?: string;
  branchId?: string;
}

export interface LoansReportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  organizationName?: string;
  clientType?: string;
  payrollType?: string;
  includeArrears?: boolean;
}

export interface RepaymentsReportFilters {
  payPeriod?: string;
  payrollType?: string;
  startDate?: string;
  endDate?: string;
}

export interface RecoveriesReportFilters {
  payPeriod?: string;
  reportType?: 'missed' | 'partial' | 'notices';
  startDate?: string;
  endDate?: string;
}

export interface PromotionsReportFilters {
  startDate?: string;
  endDate?: string;
  campaignId?: string;
}

// =====================================================
// 1. USER MANAGEMENT REPORTS
// =====================================================

export const getUsersReport = async (filters: UsersReportFilters = {}) => {
  let query = supabase
    .from('user_profiles')
    .select(`
      *,
      branches:branch_id(branch_name, branch_code)
    `)
    .order('created_at', { ascending: false });

  if (filters.role) {
    query = query.eq('role', filters.role);
  }

  if (filters.branchId) {
    query = query.eq('branch_id', filters.branchId);
  }

  const { data: users, error } = await query;

  if (error) throw error;

  // Get activity counts for each user
  const usersWithActivity = await Promise.all(
    (users || []).map(async (user) => {
      const { count } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user_id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      return {
        ...user,
        activity_count_30d: count || 0,
      };
    })
  );

  return usersWithActivity;
};

// =====================================================
// 2. BORROWERS REPORTS
// =====================================================

export const getBorrowersReport = async (filters: BorrowersReportFilters = {}) => {
  let query = supabase
    .from('borrowers')
    .select(`
      *,
      branches:branch_id(branch_name, branch_code)
    `)
    .order('department_company', { ascending: true })
    .order('created_at', { ascending: false });

  if (filters.organizationName) {
    query = query.eq('department_company', filters.organizationName);
  }

  const { data: borrowers, error } = await query;

  if (error) throw error;

  // Get loan counts for each borrower
  const borrowersWithLoans = await Promise.all(
    (borrowers || []).map(async (borrower) => {
      const { data: loans } = await supabase
        .from('loans')
        .select('loan_id, loan_status')
        .eq('borrower_id', borrower.borrower_id);

      return {
        ...borrower,
        total_loans: loans?.length || 0,
        active_loans: loans?.filter(l => l.loan_status === 'active').length || 0,
      };
    })
  );

  // Group by department/company
  const grouped = borrowersWithLoans.reduce((acc, borrower) => {
    const org = borrower.department_company || 'Unassigned';
    if (!acc[org]) {
      acc[org] = [];
    }
    acc[org].push(borrower);
    return acc;
  }, {} as Record<string, typeof borrowersWithLoans>);

  return {
    borrowers: borrowersWithLoans,
    grouped,
    summary: {
      total: borrowersWithLoans.length,
      by_organization: Object.keys(grouped).map(org => ({
        organization: org,
        count: grouped[org].length,
      })),
    },
  };
};

// =====================================================
// 3. APPLICATIONS REPORTS
// =====================================================

export const getApplicationsReport = async (filters: ApplicationsReportFilters) => {
  const startDate = `${filters.year}-01-01`;
  const endDate = `${filters.year}-12-31`;

  let query = supabase
    .from('applications')
    .select(`
      *,
      application_audit_trail(*)
    `)
    .gte('submission_date', startDate)
    .lte('submission_date', endDate)
    .order('submission_date', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status as any);
  }

  const { data: applications, error } = await query;

  if (error) throw error;

  // Get reviewer details
  const applicationsWithDetails = await Promise.all(
    (applications || []).map(async (app) => {
      const reviewedByUser = app.reviewed_by ? await supabase
        .from('user_profiles')
        .select('first_name, last_name, role')
        .eq('user_id', app.reviewed_by)
        .single() : null;

      const approvedByUser = app.approved_by ? await supabase
        .from('user_profiles')
        .select('first_name, last_name, role')
        .eq('user_id', app.approved_by)
        .single() : null;

      const declinedByUser = app.declined_by ? await supabase
        .from('user_profiles')
        .select('first_name, last_name, role')
        .eq('user_id', app.declined_by)
        .single() : null;

      // Calculate processing time
      const submissionDate = new Date(app.submission_date);
      const finalDate = app.approved_at || app.declined_at;
      const processingDays = finalDate 
        ? Math.ceil((new Date(finalDate).getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        ...app,
        reviewed_by_name: reviewedByUser?.data ? `${reviewedByUser.data.first_name} ${reviewedByUser.data.last_name}` : null,
        approved_by_name: approvedByUser?.data ? `${approvedByUser.data.first_name} ${approvedByUser.data.last_name}` : null,
        declined_by_name: declinedByUser?.data ? `${declinedByUser.data.first_name} ${declinedByUser.data.last_name}` : null,
        processing_days: processingDays,
      };
    })
  );

  return {
    applications: applicationsWithDetails,
    summary: {
      total: applicationsWithDetails.length,
      approved: applicationsWithDetails.filter(a => a.status === 'approved').length,
      declined: applicationsWithDetails.filter(a => a.status === 'declined').length,
      pending: applicationsWithDetails.filter(a => a.status === 'pending').length,
      avg_processing_days: applicationsWithDetails
        .filter(a => a.processing_days !== null)
        .reduce((sum, a) => sum + (a.processing_days || 0), 0) / 
        applicationsWithDetails.filter(a => a.processing_days !== null).length || 0,
    },
  };
};

// =====================================================
// 4. LOANS REPORTS
// =====================================================

export const getLoansReport = async (filters: LoansReportFilters = {}) => {
  let query = supabase
    .from('loans')
    .select(`
      *,
      borrowers:borrower_id(
        borrower_id,
        given_name,
        surname,
        file_number,
        department_company,
        client_type,
        branch_id,
        branches:branch_id(branch_name, branch_code)
      )
    `)
    .order('disbursement_date', { ascending: false });

  if (filters.startDate) {
    query = query.gte('disbursement_date', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('disbursement_date', filters.endDate);
  }

  if (filters.status) {
    query = query.eq('loan_status', filters.status as any);
  }

  if (filters.includeArrears) {
    query = query.gt('arrears', 0);
  }

  const { data: loans, error } = await query;

  if (error) throw error;

  // Filter by organization/client type if needed
  let filteredLoans = loans || [];

  if (filters.organizationName) {
    filteredLoans = filteredLoans.filter(
      loan => loan.borrowers?.department_company === filters.organizationName
    );
  }

  if (filters.clientType) {
    filteredLoans = filteredLoans.filter(
      loan => loan.borrowers?.client_type === filters.clientType
    );
  }

  // Get payroll type from repayment schedule
  const loansWithPayroll = await Promise.all(
    filteredLoans.map(async (loan) => {
      const { data: schedule } = await supabase
        .from('repayment_schedule')
        .select('payroll_type')
        .eq('loan_id', loan.loan_id)
        .limit(1)
        .single();

      return {
        ...loan,
        payroll_type: schedule?.payroll_type || null,
      };
    })
  );

  // Filter by payroll type if specified
  const finalLoans = filters.payrollType
    ? loansWithPayroll.filter(loan => loan.payroll_type === filters.payrollType)
    : loansWithPayroll;

  return {
    loans: finalLoans,
    summary: {
      total: finalLoans.length,
      active: finalLoans.filter(l => l.loan_status === 'active').length,
      settled: finalLoans.filter(l => l.loan_status === 'settled').length,
      overdue: finalLoans.filter(l => l.loan_status === 'overdue').length,
      total_principal: finalLoans.reduce((sum, l) => sum + (l.principal || 0), 0),
      total_outstanding: finalLoans.reduce((sum, l) => sum + (l.outstanding_balance || 0), 0),
      total_arrears: finalLoans.reduce((sum, l) => sum + (l.arrears || 0), 0),
      by_organization: groupByOrganization(finalLoans),
      by_payroll_type: groupByPayrollType(finalLoans),
      by_client_type: groupByClientType(finalLoans),
    },
  };
};

// =====================================================
// 5. REPAYMENTS REPORTS
// =====================================================

export const getRepaymentsReport = async (filters: RepaymentsReportFilters = {}) => {
  let query = supabase
    .from('repayment_schedule')
    .select(`
      *,
      loans:loan_id(
        loan_id,
        borrower_id,
        borrowers:borrower_id(
          given_name,
          surname,
          file_number,
          department_company
        )
      )
    `)
    .in('statusrs', ['pending', 'paid', 'partial'])
    .order('due_date', { ascending: false });

  if (filters.payPeriod) {
    query = query.eq('pay_period', filters.payPeriod);
  }

  if (filters.payrollType) {
    query = query.eq('payroll_type', filters.payrollType);
  }

  if (filters.startDate) {
    query = query.gte('due_date', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('due_date', filters.endDate);
  }

  const { data: schedules, error } = await query;

  if (error) throw error;

  // Calculate collection ratings
  const schedulesWithRatings = (schedules || []).map(schedule => {
    const expected = schedule.repaymentrs || 0;
    const collected = schedule.repayment_received || 0;
    const collectionRate = expected > 0 ? (collected / expected) * 100 : 0;

    let rating: 'full' | 'partial' | 'missed';
    if (collectionRate >= 100) rating = 'full';
    else if (collectionRate > 0) rating = 'partial';
    else rating = 'missed';

    return {
      ...schedule,
      collection_rate: collectionRate,
      collection_rating: rating,
    };
  });

  // Group by payroll type
  const grouped = schedulesWithRatings.reduce((acc, schedule) => {
    const type = schedule.payroll_type || 'unknown';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(schedule);
    return acc;
  }, {} as Record<string, typeof schedulesWithRatings>);

  return {
    schedules: schedulesWithRatings,
    grouped,
    summary: {
      total_expected: schedulesWithRatings.reduce((sum, s) => sum + (s.repaymentrs || 0), 0),
      total_collected: schedulesWithRatings.reduce((sum, s) => sum + (s.repayment_received || 0), 0),
      principal_collected: schedulesWithRatings.reduce((sum, s) => sum + (s.received_principal || 0), 0),
      interest_collected: schedulesWithRatings.reduce((sum, s) => sum + (s.received_interest || 0), 0),
      doc_fees_collected: schedulesWithRatings.reduce((sum, s) => sum + (s.received_documentation_fee || 0), 0),
      risk_insurance_collected: schedulesWithRatings.reduce((sum, s) => sum + (s.received_loan_risk_insurance || 0), 0),
      full_payments: schedulesWithRatings.filter(s => s.collection_rating === 'full').length,
      partial_payments: schedulesWithRatings.filter(s => s.collection_rating === 'partial').length,
      missed_payments: schedulesWithRatings.filter(s => s.collection_rating === 'missed').length,
      by_payroll_type: Object.keys(grouped).map(type => ({
        payroll_type: type,
        count: grouped[type].length,
        expected: grouped[type].reduce((sum, s) => sum + (s.repaymentrs || 0), 0),
        collected: grouped[type].reduce((sum, s) => sum + (s.repayment_received || 0), 0),
        collection_rate: (grouped[type].reduce((sum, s) => sum + (s.repayment_received || 0), 0) / 
          grouped[type].reduce((sum, s) => sum + (s.repaymentrs || 0), 0)) * 100,
      })),
    },
  };
};

// =====================================================
// 6. RECOVERIES REPORTS
// =====================================================

export const getRecoveriesReport = async (filters: RecoveriesReportFilters = {}) => {
  if (filters.reportType === 'notices') {
    // Get recovery notices
    let query = supabase
      .from('recovery_notices')
      .select(`
        *,
        loans:loan_id(
          borrower_id,
          borrowers:borrower_id(
            given_name,
            surname,
            department_company
          )
        )
      `)
      .order('sent_at', { ascending: false });

    if (filters.startDate) {
      query = query.gte('sent_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('sent_at', filters.endDate);
    }

    const { data: notices, error } = await query;

    if (error) throw error;

    return {
      notices,
      summary: {
        total: notices?.length || 0,
        by_type: groupNoticesByType(notices || []),
      },
    };
  }

  // Get missed and partial payments
  let query = supabase
    .from('repayment_schedule')
    .select(`
      *,
      loans:loan_id(
        loan_id,
        borrower_id,
        borrowers:borrower_id(
          given_name,
          surname,
          file_number,
          department_company
        )
      )
    `)
    .order('due_date', { ascending: false });

  if (filters.reportType === 'missed') {
    query = query.eq('statusrs', 'default');
  } else if (filters.reportType === 'partial') {
    query = query.eq('statusrs', 'partial');
  } else {
    query = query.in('statusrs', ['default', 'partial']);
  }

  if (filters.payPeriod) {
    query = query.eq('pay_period', filters.payPeriod);
  }

  if (filters.startDate) {
    query = query.gte('due_date', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('due_date', filters.endDate);
  }

  const { data: schedules, error } = await query;

  if (error) throw error;

  return {
    schedules,
    summary: {
      total: schedules?.length || 0,
      total_expected: schedules?.reduce((sum, s) => sum + (s.repaymentrs || 0), 0) || 0,
      total_collected: schedules?.reduce((sum, s) => sum + (s.repayment_received || 0), 0) || 0,
      total_outstanding: schedules?.reduce((sum, s) => sum + (s.balance || 0), 0) || 0,
      total_default_fees: schedules?.reduce((sum, s) => sum + (s.default_charged || 0), 0) || 0,
    },
  };
};

// =====================================================
// 7. PROMOTIONS REPORTS
// =====================================================

export const getPromotionsReport = async (filters: PromotionsReportFilters = {}) => {
  let query = supabase
    .from('promotion_campaigns')
    .select(`
      *,
      promotion_recipients(count)
    `)
    .order('created_at', { ascending: false });

  if (filters.campaignId) {
    query = query.eq('id', filters.campaignId);
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  const { data: campaigns, error } = await query;

  if (error) throw error;

  return {
    campaigns,
    summary: {
      total_campaigns: campaigns?.length || 0,
      total_sent: campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0,
      total_delivered: campaigns?.reduce((sum, c) => sum + (c.delivered_count || 0), 0) || 0,
      total_opened: campaigns?.reduce((sum, c) => sum + (c.opened_count || 0), 0) || 0,
      total_clicked: campaigns?.reduce((sum, c) => sum + (c.clicked_count || 0), 0) || 0,
      avg_delivery_rate: calculateAvgRate(campaigns || [], 'delivered_count', 'sent_count'),
      avg_open_rate: calculateAvgRate(campaigns || [], 'opened_count', 'delivered_count'),
      avg_click_rate: calculateAvgRate(campaigns || [], 'clicked_count', 'opened_count'),
    },
  };
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function groupByOrganization(loans: any[]) {
  const grouped = loans.reduce((acc, loan) => {
    const org = loan.borrowers?.department_company || 'Unassigned';
    if (!acc[org]) {
      acc[org] = { count: 0, outstanding: 0, arrears: 0 };
    }
    acc[org].count++;
    acc[org].outstanding += loan.outstanding_balance || 0;
    acc[org].arrears += loan.arrears || 0;
    return acc;
  }, {} as Record<string, { count: number; outstanding: number; arrears: number }>);

  return Object.keys(grouped).map(org => ({
    organization: org,
    ...grouped[org],
  }));
}

function groupByPayrollType(loans: any[]) {
  const grouped = loans.reduce((acc, loan) => {
    const type = loan.payroll_type || 'unknown';
    if (!acc[type]) {
      acc[type] = { count: 0, outstanding: 0 };
    }
    acc[type].count++;
    acc[type].outstanding += loan.outstanding_balance || 0;
    return acc;
  }, {} as Record<string, { count: number; outstanding: number }>);

  return Object.keys(grouped).map(type => ({
    payroll_type: type,
    ...grouped[type],
  }));
}

function groupByClientType(loans: any[]) {
  const grouped = loans.reduce((acc, loan) => {
    const type = loan.borrowers?.client_type || 'unknown';
    if (!acc[type]) {
      acc[type] = { count: 0, outstanding: 0 };
    }
    acc[type].count++;
    acc[type].outstanding += loan.outstanding_balance || 0;
    return acc;
  }, {} as Record<string, { count: number; outstanding: number }>);

  return Object.keys(grouped).map(type => ({
    client_type: type,
    ...grouped[type],
  }));
}

function groupNoticesByType(notices: any[]) {
  const grouped = notices.reduce((acc, notice) => {
    const type = notice.notice_type;
    if (!acc[type]) {
      acc[type] = 0;
    }
    acc[type]++;
    return acc;
  }, {} as Record<string, number>);

  return Object.keys(grouped).map(type => ({
    notice_type: type,
    count: grouped[type],
  }));
}

function calculateAvgRate(campaigns: any[], numeratorField: string, denominatorField: string) {
  const validCampaigns = campaigns.filter(c => (c[denominatorField] || 0) > 0);
  if (validCampaigns.length === 0) return 0;

  const totalRate = validCampaigns.reduce((sum, c) => {
    const rate = ((c[numeratorField] || 0) / (c[denominatorField] || 1)) * 100;
    return sum + rate;
  }, 0);

  return totalRate / validCampaigns.length;
}
