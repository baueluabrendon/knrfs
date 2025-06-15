
import { useQuery } from "@tanstack/react-query";
import { recoveriesApi } from "@/lib/api/recoveries";
import { parseISO, isValid, format } from "date-fns";

export interface MissedPayment {
  loanId: string;
  borrowerName: string;
  fileNumber: string;
  organization: string;
  payPeriod: string;
  payrollType: string;
  dueDate: string;
  amountDue: number;
  defaultAmount: number;
  outstandingBalance: number;
}

export const useMissedPayments = () => {
  return useQuery({
    queryKey: ["missed-payments"],
    queryFn: async () => {
      const result = await recoveriesApi.getMissedPayments();
      
      // Transform the API response to match our interface
      const transformedResult = result.map(r => ({
        loanId: r.loan_id,
        borrowerName: r.borrower_name,
        fileNumber: r.file_number,
        organization: r.organization,
        payPeriod: r.pay_period,
        payrollType: 'N/A', // Not available in current API response
        dueDate: r.due_date,
        amountDue: r.scheduled_amount,
        defaultAmount: r.scheduled_amount, // Using scheduled_amount as default
        outstandingBalance: r.scheduled_amount // Using scheduled_amount as outstanding
      }));
      
      const validDates = transformedResult.filter(r => isValid(parseISO(r.dueDate)));
      
      const uniqueYears = [...new Set(validDates.map(r => format(parseISO(r.dueDate), "yyyy")))].sort().reverse();
      const uniqueMonths = [...new Set(validDates.map(r => format(parseISO(r.dueDate), "MMMM")))];
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
