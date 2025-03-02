
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import BorrowerSelect from "./BorrowerSelect";
import { calculateLoanValues } from "@/utils/loanCalculations";

const LoanFormFields = () => {
  const form = useFormContext();
  
  // Calculate fortnightly installment when principal or loanTerm changes
  useEffect(() => {
    const principal = form.watch("principal");
    const loanTerm = form.watch("loanTerm");
    
    if (principal > 0 && loanTerm > 0) {
      const loanValues = calculateLoanValues(principal, loanTerm);
      form.setValue("fortnightlyInstallment", loanValues.fortnightlyInstallment);
    } else {
      form.setValue("fortnightlyInstallment", null);
    }
  }, [form.watch("principal"), form.watch("loanTerm"), form]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="borrowerId"
        render={({ field }) => (
          <BorrowerSelect name={field.name} />
        )}
      />

      <FormField
        control={form.control}
        name="principal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Loan Amount</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="loanTerm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Loan Term (months)</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fortnightlyInstallment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fortnightly Repayment (Calculated)</FormLabel>
            <Input 
              type="number" 
              value={field.value || ""} 
              readOnly 
              disabled 
              className="bg-gray-50"
              onChange={field.onChange}
            />
            <p className="text-xs text-muted-foreground mt-1">
              This value is calculated based on loan amount and term
            </p>
          </FormItem>
        )}
      />
    </div>
  );
};

export default LoanFormFields;
