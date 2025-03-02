
import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Validation schema for loan form
const loanFormSchema = z.object({
  borrowerId: z.string().min(1, { message: "Please select a borrower" }),
  principal: z.coerce.number().positive({ message: "Loan amount must be positive" }),
  loanTerm: z.coerce.number().int().positive({ message: "Loan term must be a positive integer" }),
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
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [fortnightlyInstallment, setFortnightlyInstallment] = useState<number | null>(null);

  // Initialize the form with react-hook-form
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      borrowerId: "",
      principal: 0,
      loanTerm: 12,
    },
  });

  // Fetch borrowers on component mount
  useEffect(() => {
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

  // Calculate fortnightly installment when principal or loanTerm changes
  useEffect(() => {
    const principal = form.watch("principal");
    const loanTerm = form.watch("loanTerm");
    
    if (principal > 0 && loanTerm > 0) {
      // Simple calculation for demonstration - in reality would include interest
      const totalRepayment = principal * 1.1; // Example: 10% total interest
      const installment = totalRepayment / (loanTerm * 2); // Assuming fortnightly payments
      setFortnightlyInstallment(Number(installment.toFixed(2)));
    } else {
      setFortnightlyInstallment(null);
    }
  }, [form.watch("principal"), form.watch("loanTerm")]);

  const filteredBorrowers = borrowers.filter(borrower => 
    `${borrower.given_name} ${borrower.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    borrower.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (values: LoanFormValues) => {
    setIsLoading(true);
    try {
      // Generate a loan ID
      const loanId = `L${Date.now().toString().slice(-6)}`;
      
      // Find the selected borrower to get their full information
      const selectedBorrower = borrowers.find(b => b.borrower_id === values.borrowerId);
      
      if (!selectedBorrower) {
        throw new Error("Selected borrower not found");
      }
      
      // Create the loan record with minimal required fields
      const { error } = await supabase.from("loans").insert({
        loan_id: loanId,
        borrower_id: values.borrowerId,
        principal: values.principal,
        loan_term: values.loanTerm,
        fortnightly_installment: fortnightlyInstallment || 0,
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Borrower</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="justify-between h-10 w-full"
                          >
                            {field.value
                              ? borrowers.find((borrower) => borrower.borrower_id === field.value)
                                ? `${borrowers.find((borrower) => borrower.borrower_id === field.value)?.given_name} ${borrowers.find((borrower) => borrower.borrower_id === field.value)?.surname}`
                                : "Select borrower"
                              : "Select borrower"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--popover-width] p-0" style={{ "--popover-width": "var(--radix-popover-trigger-width)" } as React.CSSProperties}>
                        <Command>
                          <CommandInput 
                            placeholder="Search borrower..." 
                            onValueChange={setSearchTerm} 
                            className="h-9" 
                          />
                          <CommandEmpty>No borrower found.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {filteredBorrowers.map((borrower) => (
                              <CommandItem
                                key={borrower.borrower_id}
                                value={`${borrower.given_name} ${borrower.surname}`}
                                onSelect={() => {
                                  form.setValue("borrowerId", borrower.borrower_id);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    borrower.borrower_id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{borrower.given_name} {borrower.surname}</span>
                                  <span className="text-xs text-muted-foreground">{borrower.email}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
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

              <FormItem>
                <FormLabel>Fortnightly Repayment (Calculated)</FormLabel>
                <Input 
                  type="number" 
                  value={fortnightlyInstallment || ""} 
                  readOnly 
                  disabled 
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This value is calculated based on loan amount and term
                </p>
              </FormItem>
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
