
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import LoansHeader from "@/components/loans/LoansHeader";
import LoansTable from "@/components/loans/LoansTable";
import { useLoansList } from "@/hooks/useLoansList";
import { RepaymentSchedule } from "@/components/loans/RepaymentSchedule";

interface Loan {
  loan_id: string;
  borrower_id: string;
  principal: number;
  interest: number;
  interest_rate?: string;
  loan_term?: string;
  gross_loan: number;
  fortnightly_installment: number;
  disbursement_date?: string;
  maturity_date?: string;
  start_repayment_date?: string;
  loan_repayment_status?: string;
  total_repayment?: number;
  outstanding_balance?: number;
  repayment_completion_percentage?: number;
  arrears?: number;
  default_fees_accumulated?: number;
  missed_payments_count?: number;
  partial_payments_count?: number;
  loan_status?: string;
  refinanced_by?: string;
  application_id?: string;
  loan_risk_insurance: number;
  documentation_fee: number;
  borrower?: {
    given_name: string;
    surname: string;
    email: string;
  };
}

const Loans = () => {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { 
    filteredLoans, 
    loading, 
    searchQuery, 
    setSearchQuery, 
    loans 
  } = useLoansList();

  const handleSelectLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsDetailsOpen(true);
  };

  const getInterestRateValue = (loan: Loan) => {
    if (!loan.interest_rate) return 'N/A';
    const rateMatch = loan.interest_rate.match(/RATE_(\d+)/);
    return rateMatch ? `${rateMatch[1]}%` : loan.interest_rate;
  };

  const getLoanTermValue = (loan: Loan): number => {
    if (!loan.loan_term) return 0;
    const termMatch = loan.loan_term.match(/TERM_(\d+)/);
    return termMatch ? parseInt(termMatch[1], 10) : 0;
  };

  const getBorrowerFullName = (loan: Loan) => {
    return loan.borrower ? `${loan.borrower.given_name} ${loan.borrower.surname}` : 'N/A';
  };

  return (
    <div className="space-y-6">
      <LoansHeader />

      <Card className="p-6">
        <LoansTable
          loans={filteredLoans}
          loading={loading}
          onSelectLoan={handleSelectLoan}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={loans.length}
          filteredCount={filteredLoans.length}
        />
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loan Repayment Schedule</DialogTitle>
            <DialogDescription>
              This shows the repayment history and schedule for the selected loan.
            </DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <RepaymentSchedule 
              loan={{
                id: selectedLoan.loan_id,
                borrowerName: getBorrowerFullName(selectedLoan),
                amount: selectedLoan.principal,
                interestRate: parseFloat(
                  getInterestRateValue(selectedLoan).replace("%", "")
                ),
                term: getLoanTermValue(selectedLoan),
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Loans;
