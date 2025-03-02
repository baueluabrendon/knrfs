
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BorrowerSelect from "./BorrowerSelect";
import { calculateLoanValues, VALID_LOAN_TERMS, LOAN_TERM_INTEREST_RATE_MAP } from "@/utils/loanCalculations";

const LoanFormFields = () => {
  const form = useFormContext();
  
  // Calculate loan values when principal or loanTerm changes
  useEffect(() => {
    const principal = form.watch("principal");
    const loanTerm = form.watch("loanTerm");
    
    if (principal > 0 && loanTerm > 0) {
      const loanValues = calculateLoanValues(principal, loanTerm);
      form.setValue("fortnightlyInstallment", loanValues.fortnightlyInstallment);
      form.setValue("interest", loanValues.interest);
      form.setValue("interestRate", loanValues.interestRate);
      form.setValue("loanRiskInsurance", loanValues.loanRiskInsurance);
      form.setValue("grossLoan", loanValues.grossLoan);
      form.setValue("documentationFee", loanValues.documentationFee || 50);
    } else {
      form.setValue("fortnightlyInstallment", null);
      form.setValue("interest", null);
      form.setValue("interestRate", null);
      form.setValue("loanRiskInsurance", null);
      form.setValue("grossLoan", null);
      form.setValue("documentationFee", 50);
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
            <FormLabel>Loan Term (bi-weekly periods)</FormLabel>
            <Select 
              onValueChange={(value) => field.onChange(Number(value))}
              value={field.value?.toString() || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select loan term" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {VALID_LOAN_TERMS.map((term) => (
                  <SelectItem key={term} value={term.toString()}>
                    {term} periods ({LOAN_TERM_INTEREST_RATE_MAP[term]}% interest)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fortnightlyInstallment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bi-weekly Repayment (Calculated)</FormLabel>
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

      <FormField
        control={form.control}
        name="interest"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Interest (Calculated)</FormLabel>
            <Input 
              type="number" 
              value={field.value || ""} 
              readOnly 
              disabled 
              className="bg-gray-50"
              onChange={field.onChange}
            />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="loanRiskInsurance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Loan Risk Insurance (2%)</FormLabel>
            <Input 
              type="number" 
              value={field.value || ""} 
              readOnly 
              disabled 
              className="bg-gray-50"
              onChange={field.onChange}
            />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="documentationFee"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Documentation Fee</FormLabel>
            <Input 
              type="number" 
              value={field.value || 50} 
              readOnly 
              disabled 
              className="bg-gray-50"
              onChange={field.onChange}
            />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="grossLoan"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gross Loan (Calculated)</FormLabel>
            <Input 
              type="number" 
              value={field.value || ""} 
              readOnly 
              disabled 
              className="bg-gray-50"
              onChange={field.onChange}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Principal + Interest + Insurance + Documentation Fee
            </p>
          </FormItem>
        )}
      />
    </div>
  );
};

export default LoanFormFields;
