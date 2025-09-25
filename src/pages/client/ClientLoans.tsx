
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw, Eye } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RepaymentSchedule } from "@/components/loans/RepaymentSchedule";
import { useClientLoans } from "@/hooks/useClientData";
import { useRefinanceEligibility } from "@/hooks/useRefinanceEligibility";
import { RefinanceDialog } from "@/components/client/RefinanceDialog";
import { toast } from "sonner";

const ClientLoans = () => {
  const { user } = useAuth();
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [isRepaymentScheduleOpen, setIsRepaymentScheduleOpen] = useState(false);
  const [refinanceDialogOpen, setRefinanceDialogOpen] = useState(false);
  const [loanForRefinance, setLoanForRefinance] = useState<any | null>(null);
  
  const { data: loans, isLoading } = useClientLoans();

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

  const handleRefinanceClick = (loan: any) => {
    setLoanForRefinance(loan);
    setRefinanceDialogOpen(true);
  };

  const RefinanceButton = ({ loan }: { loan: any }) => {
    const { isEligible, reason } = useRefinanceEligibility(loan);
    
    return (
      <Button
        size="sm"
        variant={isEligible ? "default" : "outline"}
        disabled={!isEligible}
        onClick={() => isEligible ? handleRefinanceClick(loan) : toast.info(reason)}
        className={isEligible ? "bg-blue-600 hover:bg-blue-700" : ""}
      >
        <RefreshCw className="mr-1 h-3 w-3" />
        {isEligible ? "Refinance" : "Not Eligible"}
      </Button>
    );
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loans || loans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
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
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoanClick(loan)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <RefinanceButton loan={loan} />
                    </div>
                  </TableCell>
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

      <RefinanceDialog
        isOpen={refinanceDialogOpen}
        onClose={() => setRefinanceDialogOpen(false)}
        loan={loanForRefinance}
      />
    </div>
  );
};

export default ClientLoans;
