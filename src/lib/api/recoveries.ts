
import { supabase } from '@/integrations/supabase/client';

export const recoveriesApi = {
  async getLoansInArrears() {
    try {
      const { data, error } = await supabase
        .from('loans_in_arrears_view')
        .select('*')
        .gt('arrears', 0)
        .eq('loan_status', 'active');

      if (error) throw error;

      return data?.map(loan => ({
        loan_id: loan.loan_id,
        borrower_name: loan.borrower_name,
        file_number: loan.file_number,
        email: loan.email,
        mobile_number: loan.mobile_number,
        organization: loan.organization,
        loan_amount: (loan.principal || 0) + (loan.interest || 0),
        arrears: loan.arrears || 0,
        days_late: loan.days_late || 0,
        overdue_bucket: loan.overdue_bucket || 'N/A',
        last_payment_date: loan.last_payment_date,
        pay_period: loan.pay_period || 'N/A'
      })) || [];
    } catch (error) {
      console.error('Error fetching loans in arrears:', error);
      throw error;
    }
  },

  async getMissedPayments() {
    try {
      const { data, error } = await supabase
        .from('loans_in_arrears_view')
        .select('*')
        .not('missed_schedule_id', 'is', null)
        .order('next_due_date', { ascending: false });

      if (error) throw error;

      return data?.map(loan => ({
        loan_id: loan.loan_id,
        borrower_name: loan.borrower_name,
        file_number: loan.file_number,
        email: loan.email,
        mobile_number: loan.mobile_number,
        organization: loan.organization,
        scheduled_amount: loan.missed_due_amount || 0,
        due_date: loan.next_due_date,
        days_overdue: loan.days_late || 0,
        pay_period: loan.pay_period || 'N/A',
        payment_number: 0 // Not available in view
      })) || [];
    } catch (error) {
      console.error('Error fetching missed payments:', error);
      throw error;
    }
  },

  async getPartialPayments() {
    try {
      const { data, error } = await supabase
        .from('loans_in_arrears_view')
        .select('*')
        .gt('partial_payments_count', 0)
        .order('next_due_date', { ascending: false });

      if (error) throw error;

      return data?.map(loan => ({
        loan_id: loan.loan_id,
        borrower_name: loan.borrower_name,
        file_number: loan.file_number,
        email: loan.email,
        mobile_number: loan.mobile_number,
        organization: loan.organization,
        scheduled_amount: loan.next_installment_due || 0,
        paid_amount: (loan.next_installment_due || 0) - (loan.next_schedule_balance || 0),
        outstanding_amount: loan.next_schedule_balance || 0,
        due_date: loan.next_due_date,
        payment_date: loan.last_payment_date,
        pay_period: loan.pay_period || 'N/A',
        payment_number: 0 // Not available in view
      })) || [];
    } catch (error) {
      console.error('Error fetching partial payments:', error);
      throw error;
    }
  },

  async getClientsForDeductionRequest(organization?: string, payPeriod?: string) {
    try {
      const { data, error } = await supabase
        .from('repayment_schedule')
        .select(`
          schedule_id,
          loan_id,
          due_date,
          pay_period,
          payroll_type,
          repaymentrs,
          loans!inner (
            fortnightly_installment,
            outstanding_balance,
            arrears,
            loan_status,
            borrower_id,
            borrowers!inner (
              given_name,
              surname,
              file_number,
              department_company,
              email,
              mobile_number
            )
          )
        `)
        .eq('statusrs', 'default')
        .lt('due_date', new Date().toISOString().split('T')[0])
        .eq('loans.loan_status', 'active')
        .order('due_date', { ascending: false });

      if (error) throw error;

      let result = data?.map(schedule => ({
        schedule_id: schedule.schedule_id,
        loan_id: schedule.loan_id,
        missed_payment_date: schedule.due_date,
        pay_period: schedule.pay_period || 'N/A',
        payroll_type: schedule.payroll_type,
        scheduled_repayment_amount: schedule.repaymentrs || 0,
        fortnightly_installment: schedule.loans?.fortnightly_installment || 0,
        outstanding_balance: schedule.loans?.outstanding_balance || 0,
        arrears: schedule.loans?.arrears || 0,
        borrower_name: `${schedule.loans?.borrowers?.given_name} ${schedule.loans?.borrowers?.surname}`,
        file_number: schedule.loans?.borrowers?.file_number,
        organization: schedule.loans?.borrowers?.department_company,
        email: schedule.loans?.borrowers?.email,
        mobile_number: schedule.loans?.borrowers?.mobile_number,
      })) || [];

      // Filter by organization if provided
      if (organization) {
        result = result.filter(client => client.organization === organization);
      }

      // Filter by pay period if provided
      if (payPeriod) {
        result = result.filter(client => client.pay_period === payPeriod);
      }

      return result;
    } catch (error) {
      console.error('Error fetching clients for deduction request:', error);
      throw error;
    }
  },

  async getOrganizations() {
    try {
      const { data, error } = await supabase
        .from('borrowers')
        .select('department_company')
        .not('department_company', 'is', null)
        .order('department_company');

      if (error) throw error;

      // Get unique organizations
      const uniqueOrgs = [...new Set(data?.map(b => b.department_company).filter(Boolean))];
      return uniqueOrgs;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  }
};
