
import { useQuery } from "@tanstack/react-query";
import { recoveriesApi } from "@/lib/api/recoveries";
import { parseISO, isValid, format } from "date-fns";

export interface PartialPayment {
  id: string;
  borrowerName: string;
  paymentDate: string;
  amountDue: number;
  amountPaid: number;
  shortfall: number;
  loanId: string;
  payPeriod: string;
  payrollType: string;
}

export const usePartialPayments = () => {
  return useQuery({
    queryKey: ["partial-payments"],
    queryFn: async () => {
      const result = await recoveriesApi.getPartialPayments();
      
      // Transform the API response to match our interface
      const transformedResult = result.map(r => ({
        id: r.loan_id + '-' + r.payment_number, // Generate ID from loan_id and payment_number
        borrowerName: r.borrower_name,
        paymentDate: r.payment_date,
        amountDue: r.scheduled_amount,
        amountPaid: r.paid_amount,
        shortfall: r.outstanding_amount,
        loanId: r.loan_id,
        payPeriod: r.pay_period,
        payrollType: 'N/A' // Not available in current API response
      }));
      
      const validDates = transformedResult.filter(r => isValid(parseISO(r.paymentDate)));
      const uniqueYears = [...new Set(validDates.map(r => format(parseISO(r.paymentDate), "yyyy")))].sort().reverse();
      const uniqueMonths = [...new Set(validDates.map(r => format(parseISO(r.paymentDate), "MMMM")))];
      const uniquePayPeriods = [...new Set(transformedResult.map(r => r.payPeriod).filter(Boolean))];
      const uniquePayrollTypes = [...new Set(transformedResult.map(r => r.payrollType).filter(Boolean))];
      
      return {
        data: transformedResult,
        uniqueYears,
        uniqueMonths,
        uniquePayPeriods,
        uniquePayrollTypes
      };
    }
  });
};
