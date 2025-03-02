
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Validation schema for loan form
const loanFormSchema = z.object({
  borrowerId: z.string().min(1, { message: "Please select a borrower" }),
  principal: z.coerce.number().positive({ message: "Amount must be positive" }),
  interestRate: z.coerce.number().positive({ message: "Interest rate must be positive" }),
  loanTerm: z.coerce.number().int().positive({ message: "Loan term must be a positive integer" }),
  description: z.string().optional(),
  product: z.string().min(1, { message: "Please select a loan product" }),
});

type LoanFormValues = z.infer<typeof loanFormSchema>;

interface Borrower {
  borrower_id: string;
  given_name: string;
  surname: string;
  email: string;
}

const AddLoan = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);

  // Initialize the form with react-hook-form
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      borrowerId: "",
      principal: 0,
      interestRate: 5.0,
      loanTerm: 12,
      description: "",
      product: "Personal Loan",
    },
  });

  // Fetch borrowers on component mount
  useState(() => {
    const fetchBorrowers = async () => {
      try {
        const { data, error } = await supabase
          .from("borrowers")
          .select("borrower_id, given_name, surname, email");

        if (error) {
          throw error;
        }

        setBorrowers(data || []);
      } catch (error) {
        console.error("Error fetching borrowers:", error);
        toast.error("Failed to load borrowers");
      }
    };

    fetchBorrowers();
  }, []);

  const onSubmit = async (values: LoanFormValues) => {
    setIsLoading(true);
    try {
      // Calculate additional loan details
      const interest = (values.principal * values.interestRate / 100) * (values.loanTerm / 12);
      const gstAmount = interest * 0.1; // Assuming 10% GST on interest
      const totalRepayment = values.principal + interest + gstAmount;
      const fortnightlyInstallment = totalRepayment / (values.loanTerm * 2); // Assuming fortnightly payments
      
      // Generate a loan ID
      const loanId = `L${Date.now().toString().slice(-6)}`;
      
      // Create the loan record
      const { error } = await supabase.from("loans").insert({
        loan_id: loanId,
        borrower_id: values.borrowerId,
        principal: values.principal,
        interest_rate: values.interestRate,
        interest: interest,
        loan_term: values.loanTerm,
        fortnightly_installment: fortnightlyInstallment,
        gst_amount: gstAmount,
        total_repayment: totalRepayment,
        gross_loan: values.principal,
        description: values.description,
        product: values.product,
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="borrowerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Borrower</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select borrower" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {borrowers.map((borrower) => (
                          <SelectItem
                            key={borrower.borrower_id}
                            value={borrower.borrower_id}
                          >
                            {borrower.given_name} {borrower.surname} ({borrower.email})
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
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Product</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select loan product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                        <SelectItem value="Home Loan">Home Loan</SelectItem>
                        <SelectItem value="Car Loan">Car Loan</SelectItem>
                        <SelectItem value="Business Loan">Business Loan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
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
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate (%)</FormLabel>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
