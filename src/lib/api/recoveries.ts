
import { ApiResponse } from './types';
import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = 'http://localhost:5000';

export const recoveriesApi = {
  async getLoansInArrears() {
    try {
      const { data, error } = await supabase
        .from("loans_in_arrears_view")
        .select("*");
      
      if (error) throw error;
      
      // Map the returned data to our expected interface format
      return data.map((item) => ({
        loanId: item.loan_id,
        borrowerName: item.borrower_name,
        fileNumber: item.file_number || '',
        email: item.email || '',
        mobileNumber: item.mobile_number || '',
        organization: item.organization || '',
        loanAmount: item.principal + item.interest,
        amountOverdue: item.arrears,
        daysOverdue: item.days_late,
        overdueBucket: item.overdue_bucket || 'Unknown',
        lastPaymentDate: item.last_payment_date,
        payPeriod: item.pay_period || 'N/A',
      }));
    } catch (error) {
      console.error('Get loans in arrears error:', error);
      throw error;
    }
  },

  async getMissedPayments() {
    try {
      const { data, error } = await supabase
        .from("loans_in_arrears_view")
        .select("*");

      if (error) throw error;

      return data
        .filter((item) => item.missed_schedule_id !== null)
        .map((item) => ({
          loanId: item.loan_id,
          borrowerName: item.borrower_name,
          fileNumber: item.file_number || "",
          organization: item.organization || "",
          payPeriod: item.pay_period,
          payrollType: item.missed_payroll_type,
          dueDate: item.next_due_date,
          amountDue: item.missed_due_amount || item.fortnightly_installment,
          defaultAmount: item.missed_default_amount || 0,
          outstandingBalance: item.outstanding_balance || 0,
        }));
    } catch (error) {
      console.error('Get missed payments error:', error);
      throw error;
    }
  },

  async getPartialPayments() {
    try {
      const { data, error } = await supabase
        .from("repayment_schedule")
        .select(`
          *,
          loans:loan_id (
            borrower_id,
            borrowers:borrower_id (
              given_name,
              surname
            )
          )
        `)
        .eq("statusrs", "partial");

      if (error) throw error;

      return data.map((item) => {
        const borrower = item.loans?.borrowers;
        return {
          id: item.schedule_id,
          borrowerName: borrower ? `${borrower.given_name} ${borrower.surname}` : "Unknown",
          paymentDate: item.settled_date || item.due_date,
          amountDue: item.repaymentrs || 0,
          amountPaid: item.repayment_received || 0,
          shortfall: (item.repaymentrs || 0) - (item.repayment_received || 0),
          loanId: item.loan_id,
          payPeriod: item.pay_period || "N/A",
          payrollType: item.payroll_type || "N/A"
        };
      });
    } catch (error) {
      console.error('Get partial payments error:', error);
      throw error;
    }
  }
};
