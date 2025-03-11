
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

const ClientLoans = () => {
  const { user } = useAuth();

  const { data: loans, isLoading } = useQuery({
    queryKey: ['client-loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('borrower_id', user?.user_id);
      
      if (error) throw error;
      return data;
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
      <h1 className="text-2xl font-bold">My Loans</h1>
      
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans && loans.length > 0 ? (
              loans.map((loan) => (
                <TableRow key={loan.loan_id}>
                  <TableCell>{loan.loan_id}</TableCell>
                  <TableCell>${loan.principal?.toLocaleString()}</TableCell>
                  <TableCell>{loan.disbursement_date}</TableCell>
                  <TableCell>{loan.maturity_date}</TableCell>
                  <TableCell>{loan.loan_status}</TableCell>
                  <TableCell>{loan.start_repayment_date || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No loans found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ClientLoans;
