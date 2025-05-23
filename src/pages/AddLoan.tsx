
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import LoanFormFields from "@/components/loans/LoanFormFields";
import { calculateLoanValues, VALID_LOAN_TERMS } from "@/utils/loanCalculations";

// Validation schema for the loan form.
const loanFormSchema = z.object({
  borrowerId: z.string().min(1, { message: "Please select a borrower" }),
  principal: z.coerce.number().positive({ message: "Loan amount must be positive" }),
  loanTerm: z.coerce.number().refine(
    (value) => VALID_LOAN_TERMS.includes(value),
    { message: "Please select a valid loan term" }
  ),
  disbursementDate: z.date().optional(),
  startRepaymentDate: z.date().optional(),
  product: z.string().min(1, { message: "Please select a product" }),
  fortnightlyInstallment: z.number().nullable(),
  interest: z.number().nullable(),
  interestRate: z.number().nullable(),
  loanRiskInsurance: z.number().nullable(),
  grossLoan: z.number().nullable(),
  documentationFee: z.number().nullable(),
  // These fields are required and must be positive numbers
  grossSalary: z.coerce.number().min(0, { message: "Gross salary must be positive" }),
  netIncome: z.coerce.number().min(0, { message: "Net income must be positive" }),
});

type LoanFormValues = z.infer<typeof loanFormSchema>;

const AddLoan = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form with react-hook-form.
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      borrowerId: "",
      principal: 0,
      loanTerm: VALID_LOAN_TERMS[0],
      disbursementDate: undefined,
      startRepaymentDate: undefined,
      product: "",
      fortnightlyInstallment: null,
      interest: null,
      interestRate: null,
      loanRiskInsurance: null,
      grossLoan: null,
      documentationFee: 50,
      grossSalary: 0,
      netIncome: 0,
    },
  });

  const onSubmit = async (values: LoanFormValues) => {
    setIsLoading(true);
    try {
      // Calculate all required loan values.
      const {
        grossLoan,
        interest,
        interestRate,
        loanRiskInsurance,
        fortnightlyInstallment,
        documentationFee,
      } = calculateLoanValues(values.principal, values.loanTerm);

      // Determine the loan term enum value.
      const loanTermEnum = `TERM_${values.loanTerm}`;

      console.log("Submitting loan with data:", {
        borrower_id: values.borrowerId,
        principal: values.principal,
        loan_term: loanTermEnum,
        fortnightly_installment: fortnightlyInstallment,
        gross_loan: grossLoan,
        interest: interest,
        loan_risk_insurance: loanRiskInsurance,
        documentation_fee: documentationFee,
        gross_salary: values.grossSalary,
        net_income: values.netIncome,
      });

      // Create the loan record
      // Adding temporary loan_id to satisfy TypeScript, will be replaced by trigger
      const { error } = await supabase.from("loans").insert({
        loan_id: "temporary_id", // This will be overwritten by the database trigger
        borrower_id: values.borrowerId,
        principal: values.principal,
        loan_term: loanTermEnum as any,
        fortnightly_installment: fortnightlyInstallment,
        gross_loan: grossLoan,
        interest: interest,
        loan_risk_insurance: loanRiskInsurance,
        documentation_fee: documentationFee,
        loan_status: 'active',
        product: values.product,
        disbursement_date: values.disbursementDate ? values.disbursementDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        start_repayment_date: values.startRepaymentDate ? values.startRepaymentDate.toISOString().split('T')[0] : (values.disbursementDate ? values.disbursementDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        gross_salary: values.grossSalary,
        net_income: values.netIncome,
      });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast.success("Loan added successfully");
      navigate("/admin/loans");
    } catch (error) {
      console.error("Error adding loan:", error);
      toast.error("Failed to add loan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Add New Loan</h1>
      </div>
      <Card className="p-8">
        {/* Wrap the form in FormProvider so nested components can access the form context */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <LoanFormFields />
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/admin/loans")}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="px-6"
              >
                {isLoading ? "Adding..." : "Add Loan"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
};

export default AddLoan;
