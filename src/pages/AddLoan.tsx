
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
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
  fortnightlyInstallment: z.number().nullable(),
  interest: z.number().nullable(),
  interestRate: z.number().nullable(),
  loanRiskInsurance: z.number().nullable(),
  grossLoan: z.number().nullable(),
  documentationFee: z.number().nullable(),
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
      fortnightlyInstallment: null,
      interest: null,
      interestRate: null,
      loanRiskInsurance: null,
      grossLoan: null,
      documentationFee: 50,
    },
  });

  const onSubmit = async (values: LoanFormValues) => {
    setIsLoading(true);
    try {
      // Calculate all required loan values to ensure consistency.
      const {
        grossLoan,
        interest,
        interestRate,
        loanRiskInsurance,
        fortnightlyInstallment,
        documentationFee
      } = calculateLoanValues(values.principal, values.loanTerm);
      
      // Determine the loan term enum value based on the numeric term.
      const loanTermEnum = `TERM_${values.loanTerm}`;
      
      // Calculate maturity date by adding (loanTerm * 14) days to the current date.
      const maturityDate = new Date();
      maturityDate.setDate(maturityDate.getDate() + (values.loanTerm * 14));
      
      // Generate a unique loan ID (this will be replaced by a DB trigger).
      const dummyLoanId = `temp_${Date.now()}`;

      // Create the loan record with all required fields.
      const { error } = await supabase.from("loans").insert({
        loan_id: dummyLoanId, // Will be overwritten by the DB trigger.
        borrower_id: values.borrowerId,
        principal: values.principal,
        loan_term: loanTermEnum as any, // Type assertion since this is a valid enum value.
        fortnightly_installment: fortnightlyInstallment,
        gross_loan: grossLoan,
        interest: interest,
        interest_rate: `RATE_${Math.round(interestRate * 100)}` as any, // Convert to enum format.
        loan_risk_insurance: loanRiskInsurance,
        documentation_fee: documentationFee,
        loan_status: 'active', // Default status.
        maturity_date: maturityDate.toISOString().split('T')[0] // Format for PostgreSQL.
      });

      if (error) {
        throw error;
      }

      toast.success("Loan added successfully");
      navigate("/admin/loans/view");
    } catch (error) {
      console.error("Error adding loan:", error);
      toast.error("Failed to add loan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Add New Loan</h1>
      </div>
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <LoanFormFields />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/loans/view")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Loan"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default AddLoan;
