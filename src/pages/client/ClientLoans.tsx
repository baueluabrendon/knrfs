
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
import { format } from "date-fns";

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getLoanTermValue = (loanTerm?: string) => {
    if (!loanTerm) return 'N/A';
    const termMatch = loanTerm.match(/TERM_(\d+)/);
    return termMatch ? `${termMatch[1]} bi-weekly` : loanTerm;
  };

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
              <TableHead>Loan Term (Fortnights)</TableHead>
              <TableHead>Fortnightly Installment</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loans || loans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No loans found
                </TableCell>
              </TableRow>
            ) : (
              loans.map((loan) => (
                <TableRow key={loan.loan_id}>
                  <TableCell>{loan.loan_id}</TableCell>
                  <TableCell>${loan.principal?.toLocaleString()}</TableCell>
                  <TableCell>{getLoanTermValue(loan.loan_term)}</TableCell>
                  <TableCell>${loan.fortnightly_installment?.toLocaleString()}</TableCell>
                  <TableCell>{formatDate(loan.disbursement_date)}</TableCell>
                  <TableCell>{formatDate(loan.maturity_date)}</TableCell>
                  <TableCell>{loan.loan_status}</TableCell>
                  <TableCell>{formatDate(loan.start_repayment_date)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ClientLoans;
