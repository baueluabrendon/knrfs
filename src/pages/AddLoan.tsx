
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
import { calculateLoanValues } from "@/utils/loanCalculations";

// Validation schema for loan form
const loanFormSchema = z.object({
  borrowerId: z.string().min(1, { message: "Please select a borrower" }),
  principal: z.coerce.number().positive({ message: "Loan amount must be positive" }),
  loanTerm: z.coerce.number().int().positive({ message: "Loan term must be a positive integer" }),
  fortnightlyInstallment: z.number().nullable(),
});

type LoanFormValues = z.infer<typeof loanFormSchema>;

const AddLoan = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form with react-hook-form
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      borrowerId: "",
      principal: 0,
      loanTerm: 12,
      fortnightlyInstallment: null,
    },
  });

  const onSubmit = async (values: LoanFormValues) => {
    setIsLoading(true);
    try {
      // Generate a loan ID
      const loanId = `L${Date.now().toString().slice(-6)}`;
      
      // Calculate all required loan values
      const {
        grossLoan,
        interest,
        interestRate,
        loanRiskInsurance
      } = calculateLoanValues(values.principal, values.loanTerm);
      
      // Create the loan record with all required fields
      const { error } = await supabase.from("loans").insert({
        loan_id: loanId,
        borrower_id: values.borrowerId,
        principal: values.principal,
        loan_term: values.loanTerm,
        fortnightly_installment: values.fortnightlyInstallment || 0,
        gross_loan: grossLoan,
        interest: interest,
        interest_rate: interestRate,
        loan_risk_insurance: loanRiskInsurance
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
