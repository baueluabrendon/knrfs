
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

// Define a specific type for repayments
type Repayment = {
  repayment_id: string;
  due_date: string;
  amount_due: number;
  amount_paid: number | null;
  status: string | null;
  payment_date: string | null;
}

const ClientRepayments = () => {
  const { user } = useAuth();

  const { data: repayments, isLoading } = useQuery({
    queryKey: ['client-repayments', user?.user_id],
    queryFn: async () => {
      if (!user?.user_id) return [] as Repayment[];
      
      console.log("Fetching repayments for user:", user.user_id);
      
      try {
        // Explicitly check if the repayments table has the expected columns
        const { data, error } = await supabase
          .from('repayments')
          .select('repayment_id, due_date, amount_due, amount_paid, status, payment_date')
          .eq('borrower_id', user.user_id);
        
        if (error) {
          console.error("Error fetching repayments:", error);
          throw error;
        }
        
        return (data || []) as Repayment[];
      } catch (error) {
        console.error("Failed to fetch repayments:", error);
        return [] as Repayment[];
      }
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
      <h1 className="text-2xl font-bold">My Repayments</h1>
      
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Repayment ID</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount Due</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repayments && repayments.length > 0 ? (
              repayments.map((repayment) => (
                <TableRow key={repayment.repayment_id}>
                  <TableCell>{repayment.repayment_id}</TableCell>
                  <TableCell>{repayment.due_date}</TableCell>
                  <TableCell>${repayment.amount_due.toFixed(2)}</TableCell>
                  <TableCell>{repayment.amount_paid ? `$${repayment.amount_paid.toFixed(2)}` : '-'}</TableCell>
                  <TableCell>{repayment.status}</TableCell>
                  <TableCell>{repayment.payment_date || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
