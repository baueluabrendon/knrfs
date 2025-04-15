
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
      const validDates = result.filter(r => isValid(parseISO(r.dueDate)));
      
      const uniqueYears = [...new Set(validDates.map(r => format(parseISO(r.dueDate), "yyyy")))].sort().reverse();
      const uniqueMonths = [...new Set(validDates.map(r => format(parseISO(r.dueDate), "MMMM")))];
      const uniquePayPeriods = [...new Set(result.map(r => r.payPeriod).filter(Boolean))];
      const uniquePayrollTypes = [...new Set(result.map(r => r.payrollType).filter(Boolean))];
      
      return {
        data: result,
        uniqueYears,
        uniqueMonths,
        uniquePayPeriods,
        uniquePayrollTypes
      };
    }
  });
};
