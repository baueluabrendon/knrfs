
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  amount: number;           // This replaces amount_due
  payment_date: string | null;  // This will be used as due_date
  status: string;
  created_at: string | null;
}

const ClientRepayments = () => {
  const { user } = useAuth();

  const { data: repayments, isLoading } = useQuery({
    queryKey: ['client-repayments', user?.user_id],
    queryFn: async () => {
      if (!user?.user_id) return [] as Repayment[];
      
      console.log("Fetching repayments for user:", user.user_id);
      
      try {
        // Handle potential schema differences with explicit mapping
        const { data, error } = await supabase
          .from('repayments')
          .select('*')
          .eq('borrower_id', user.user_id);
        
        if (error) {
          console.error("Error fetching repayments:", error);
          throw error;
        }
        
        // Map the data to our expected format based on actual database schema
        return (data || []).map(item => ({
          repayment_id: item.repayment_id || `temp-${Date.now()}`,
          amount: Number(item.amount || 0),
          payment_date: item.payment_date,
          status: item.status || 'pending',
          created_at: item.created_at
        })) as Repayment[];
      } catch (error) {
        console.error("Failed to fetch repayments:", error);
        return [] as Repayment[];
      }
    },
    enabled: !!user?.user_id, // Only run query if we have a user ID
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
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repayments && repayments.length > 0 ? (
              repayments.map((repayment) => (
                <TableRow key={repayment.repayment_id}>
                  <TableCell>{repayment.repayment_id}</TableCell>
                  <TableCell>{repayment.payment_date ? new Date(repayment.payment_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>${repayment.amount.toFixed(2)}</TableCell>
                  <TableCell>{repayment.status}</TableCell>
                  <TableCell>{repayment.created_at ? new Date(repayment.created_at).toLocaleDateString() : '-'}</TableCell>
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
