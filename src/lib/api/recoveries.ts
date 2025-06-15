
import { supabase } from '@/integrations/supabase/client';

export const recoveriesApi = {
  async getLoansInArrears() {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          loan_id,
          borrower_id,
          principal,
          interest,
          arrears,
          last_payment_date,
          borrowers (
            given_name,
            surname,
            email,
            mobile_number,
            file_number,
            department_company
          )
        `)
        .gt('arrears', 0)
        .eq('loan_status', 'active');

      if (error) throw error;

      return data?.map(loan => ({
        loan_id: loan.loan_id,
        borrower_name: `${loan.borrowers?.given_name || ''} ${loan.borrowers?.surname || ''}`.trim(),
        file_number: loan.borrowers?.file_number || '',
        email: loan.borrowers?.email || '',
        mobile_number: loan.borrowers?.mobile_number || '',
        organization: loan.borrowers?.department_company || '',
        loan_amount: (loan.principal || 0) + (loan.interest || 0),
        arrears: loan.arrears || 0,
        days_late: loan.last_payment_date ? 
          Math.floor((new Date().getTime() - new Date(loan.last_payment_date).getTime()) / (1000 * 3600 * 24)) : 0,
        overdue_bucket: loan.arrears && loan.arrears > 1000 ? '30+ Days' : 
                       loan.arrears && loan.arrears > 500 ? '15-30 Days' : '1-15 Days',
        last_payment_date: loan.last_payment_date,
        pay_period: 'N/A'
      })) || [];
    } catch (error) {
      console.error('Error fetching loans in arrears:', error);
      throw error;
    }
  },

  async getMissedPayments() {
    try {
      const { data, error } = await supabase
        .from('repayment_schedule')
        .select(`
          *,
          loans (
            loan_id,
            borrower_id,
            borrowers (
              given_name,
              surname,
              email,
              mobile_number,
              file_number,
              department_company
            )
          )
        `)
        .eq('statusrs', 'default')
        .order('due_date', { ascending: false });

      if (error) throw error;

      return data?.map(schedule => ({
        loan_id: schedule.loans?.loan_id || '',
        borrower_name: `${schedule.loans?.borrowers?.given_name || ''} ${schedule.loans?.borrowers?.surname || ''}`.trim(),
        file_number: schedule.loans?.borrowers?.file_number || '',
        email: schedule.loans?.borrowers?.email || '',
        mobile_number: schedule.loans?.borrowers?.mobile_number || '',
        organization: schedule.loans?.borrowers?.department_company || '',
        scheduled_amount: schedule.repaymentrs || 0,
        due_date: schedule.due_date,
        days_overdue: schedule.due_date ? 
          Math.floor((new Date().getTime() - new Date(schedule.due_date).getTime()) / (1000 * 3600 * 24)) : 0,
        pay_period: schedule.pay_period || 'N/A',
        payment_number: schedule.payment_number || 0
      })) || [];
    } catch (error) {
      console.error('Error fetching missed payments:', error);
      throw error;
    }
  },

  async getPartialPayments() {
    try {
      const { data, error } = await supabase
        .from('repayment_schedule')
        .select(`
          *,
          loans (
            loan_id,
            borrower_id,
            borrowers (
              given_name,
              surname,
              email,
              mobile_number,
              file_number,
              department_company
            )
          )
        `)
        .eq('statusrs', 'partial')
        .order('due_date', { ascending: false });

      if (error) throw error;

      return data?.map(schedule => ({
        loan_id: schedule.loans?.loan_id || '',
        borrower_name: `${schedule.loans?.borrowers?.given_name || ''} ${schedule.loans?.borrowers?.surname || ''}`.trim(),
        file_number: schedule.loans?.borrowers?.file_number || '',
        email: schedule.loans?.borrowers?.email || '',
        mobile_number: schedule.loans?.borrowers?.mobile_number || '',
        organization: schedule.loans?.borrowers?.department_company || '',
        scheduled_amount: schedule.repaymentrs || 0,
        paid_amount: schedule.repayment_received || 0,
        outstanding_amount: schedule.balance || 0,
        due_date: schedule.due_date,
        payment_date: schedule.settled_date,
        pay_period: schedule.pay_period || 'N/A',
        payment_number: schedule.payment_number || 0
      })) || [];
    } catch (error) {
      console.error('Error fetching partial payments:', error);
      throw error;
    }
  }
};
