
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
      
      const validDates = result.filter(r => isValid(parseISO(r.paymentDate)));
      const uniqueYears = [...new Set(validDates.map(r => format(parseISO(r.paymentDate), "yyyy")))].sort().reverse();
      const uniqueMonths = [...new Set(validDates.map(r => format(parseISO(r.paymentDate), "MMMM")))];
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
