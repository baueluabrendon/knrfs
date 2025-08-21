
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
  }
};
