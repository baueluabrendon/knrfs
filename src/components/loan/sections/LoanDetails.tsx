
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoanApplication } from "@/contexts/LoanApplicationContext";
import { FormField, FormItem, FormControl } from "@/components/ui/form";

export const LoanDetails = () => {
  const { formData } = useLoanApplication();
  const form = useFormContext();
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-brown-800">Loan Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="financialDetails.loanPurpose"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Purpose of Loan</Label>
              <FormControl>
                <Input 
                  {...field} 
                  defaultValue={formData?.financialDetails.loanPurpose || ''} 
                  className="bg-white border-gray-200 focus:border-primary/50"
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="financialDetails.loanAmount"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Loan Amount</Label>
              <FormControl>
                <Input 
                  type="number"
                  {...field}
                  defaultValue={formData?.financialDetails.loanAmount || ''} 
                  className="bg-white border-gray-200 focus:border-primary/50"
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="financialDetails.loanTerm"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Loan Term</Label>
              <FormControl>
                <Input 
                  type="number"
                  {...field}
                  defaultValue={formData?.financialDetails.loanTerm || ''} 
                  className="bg-white border-gray-200 focus:border-primary/50"
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="financialDetails.fortnightlyInstallment"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Bi-weekly Installment</Label>
              <FormControl>
                <Input 
                  type="number"
                  {...field}
                  defaultValue={formData?.financialDetails.fortnightlyInstallment || ''} 
                  className="bg-white border-gray-200 focus:border-primary/50"
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="financialDetails.interest"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Interest</Label>
              <FormControl>
                <Input 
                  type="number"
                  {...field}
                  defaultValue={formData?.financialDetails.interest || ''} 
                  className="bg-white border-gray-200 focus:border-primary/50"
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="financialDetails.grossLoan"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Total Repayable</Label>
              <FormControl>
                <Input 
                  type="number"
                  {...field}
                  defaultValue={formData?.financialDetails.grossLoan || ''} 
                  className="bg-white border-gray-200 focus:border-primary/50"
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="employmentDetails.salary"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Gross Salary</Label>
              <FormControl>
                <Input 
                  type="number"
                  {...field}
                  defaultValue={formData?.employmentDetails.salary || ''} 
                  className="bg-white border-gray-200 focus:border-primary/50"
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="financialDetails.monthlyIncome"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Net Income</Label>
              <FormControl>
                <Input 
                  type="number"
                  {...field}
                  defaultValue={formData?.financialDetails.monthlyIncome || ''} 
                  className="bg-white border-gray-200 focus:border-primary/50"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
