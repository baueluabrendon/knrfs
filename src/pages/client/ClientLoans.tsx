
import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RepaymentSchedule } from "@/components/loans/RepaymentSchedule";

const ClientLoans = () => {
  const { user } = useAuth();
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [isRepaymentScheduleOpen, setIsRepaymentScheduleOpen] = useState(false);

  const { data: loans, isLoading } = useQuery({
    queryKey: ['client-loans', user?.user_id],
    queryFn: async () => {
      // First get the borrower_id from user_profiles
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('borrower_id')
        .eq('user_id', user?.user_id)
        .single();

      if (!userProfile?.borrower_id) {
        throw new Error('Borrower ID not found');
      }

      // Then get all loans for this borrower
      const { data, error } = await supabase
        .from('loans')
        .select(`
          loan_id,
          principal,
          loan_term,
          fortnightly_installment,
          disbursement_date,
          maturity_date,
          start_repayment_date,
          loan_status,
          outstanding_balance,
          interest_rate
        `)
        .eq('borrower_id', userProfile.borrower_id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.user_id
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getLoanTermValue = (loanTerm?: string) => {
    if (!loanTerm) return 'N/A';
    const termMatch = loanTerm.match(/TERM_(\d+)/);
    return termMatch ? termMatch[1] : loanTerm;
  };

  const getInterestRateValue = (interestRate?: string) => {
    if (!interestRate) return 'N/A';
    const rateMatch = interestRate.match(/RATE_(\d+)/);
    return rateMatch ? `${rateMatch[1]}%` : interestRate;
  };

  const handleLoanClick = (loan: any) => {
    setSelectedLoan(loan);
    setIsRepaymentScheduleOpen(true);
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
              <TableHead>Interest Rate</TableHead>
              <TableHead>Fortnightly Installment</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loans || loans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No loans found
                </TableCell>
              </TableRow>
            ) : (
              loans.map((loan) => (
                <TableRow key={loan.loan_id}>
                  <TableCell>
                    <button 
                      className="text-blue-600 hover:underline font-medium cursor-pointer"
                      onClick={() => handleLoanClick(loan)}
                    >
                      {loan.loan_id}
                    </button>
                  </TableCell>
                  <TableCell>K{loan.principal?.toLocaleString()}</TableCell>
                  <TableCell>{getLoanTermValue(loan.loan_term)}</TableCell>
                  <TableCell>{getInterestRateValue(loan.interest_rate)}</TableCell>
                  <TableCell>K{loan.fortnightly_installment?.toLocaleString()}</TableCell>
                  <TableCell>{formatDate(loan.disbursement_date)}</TableCell>
                  <TableCell>{formatDate(loan.maturity_date)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      loan.loan_status === 'active' ? 'bg-green-100 text-green-800' :
                      loan.loan_status === 'settled' ? 'bg-blue-100 text-blue-800' :
                      loan.loan_status === 'overdue' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {loan.loan_status}
                    </span>
                  </TableCell>
                  <TableCell>K{loan.outstanding_balance?.toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isRepaymentScheduleOpen} onOpenChange={setIsRepaymentScheduleOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loan Repayment Schedule</DialogTitle>
            <DialogDescription>
              Payment schedule and history for loan {selectedLoan?.loan_id}
            </DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <RepaymentSchedule 
              loan={{
                id: selectedLoan.loan_id,
                borrowerName: user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : "Client",
                amount: selectedLoan.principal,
                interestRate: parseFloat(getInterestRateValue(selectedLoan.interest_rate).replace("%", "")),
                term: parseInt(getLoanTermValue(selectedLoan.loan_term)),
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientLoans;
