
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
        organization: item.department_company || '',
        loanAmount: item.principal + item.interest, // or use gross_loan if available
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
      const response = await fetch(`${API_BASE_URL}/recoveries/missed-payments`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch missed payments');
      }
      return data.data;
    } catch (error) {
      console.error('Get missed payments error:', error);
      throw error;
    }
  },

  async getPartialPayments() {
    try {
      const response = await fetch(`${API_BASE_URL}/recoveries/partial-payments`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch partial payments');
      }
      return data.data;
    } catch (error) {
      console.error('Get partial payments error:', error);
      throw error;
    }
  }
};
