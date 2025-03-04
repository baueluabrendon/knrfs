
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

// Define a more specific type for repayments to avoid deep type instantiation
type Repayment = {
  repayment_id: string;
  loan_id: string | null;
  amount: number;
  payment_date: string | null;
  status: string | null;
}

const ClientRepayments = () => {
  const { user } = useAuth();

  // Explicitly type the queryFn return type to avoid deep instantiation
  const { data: repayments, isLoading } = useQuery({
    queryKey: ['client-repayments'],
    queryFn: async (): Promise<Repayment[]> => {
      if (!user?.user_id) return [];
      
      // Using a more direct approach with explicit typing
      const { data, error } = await supabase
        .from('repayments')
        .select('repayment_id, loan_id, amount, payment_date, status')
        .eq('borrower_id', user.user_id);
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Repayments</h1>
      
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Loan ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repayments && repayments.length > 0 ? (
              repayments.map((repayment) => (
                <TableRow key={repayment.repayment_id}>
                  <TableCell>{repayment.repayment_id}</TableCell>
                  <TableCell>{repayment.loan_id}</TableCell>
                  <TableCell>${repayment.amount?.toLocaleString()}</TableCell>
                  <TableCell>{repayment.payment_date}</TableCell>
                  <TableCell>{repayment.status}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No repayments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ClientRepayments;
