
import { useState, useEffect, ChangeEvent } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import LoanDetails from "@/components/loans/LoanDetails";
import { toast } from "sonner";
import LoansHeader from "@/components/loans/LoansHeader";
import SearchBar from "@/components/loans/SearchBar";
import LoansTable from "@/components/loans/LoansTable";
import { useLoansList } from "@/hooks/useLoansList";

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

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsDetailsOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    toast("Loan details have been emailed successfully.");
  };

  const getInterestRateValue = (loan: Loan) => {
    if (!loan.interest_rate) return 'N/A';
    const rateMatch = loan.interest_rate.match(/RATE_(\d+)/);
    return rateMatch ? `${rateMatch[1]}%` : loan.interest_rate;
  };

  const getLoanTermValue = (loan: Loan) => {
    if (!loan.loan_term) return 'N/A';
    
    // Extract the numeric value from TERM_X format
    const termMatch = loan.loan_term.match(/TERM_(\d+)/);
    return termMatch ? `${termMatch[1]} months` : loan.loan_term;
  };

  const getBorrowerFullName = (loan: Loan) => {
    return loan.borrower ? `${loan.borrower.given_name} ${loan.borrower.surname}` : 'N/A';
  };

  return (
    <div className="space-y-6">
      <LoansHeader />
      
      <SearchBar 
        searchQuery={searchQuery} 
        onSearchChange={handleSearchChange} 
        totalCount={loans.length} 
        filteredCount={filteredLoans.length} 
      />
      
      <Card className="p-6">
        <LoansTable 
          loans={filteredLoans} 
          loading={loading} 
          onSelectLoan={handleSelectLoan} 
        />
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl">
          {selectedLoan && (
            <LoanDetails
              loan={{
                id: selectedLoan.loan_id,
                borrowerName: getBorrowerFullName(selectedLoan),
                amount: selectedLoan.principal,
                interestRate: parseFloat(getInterestRateValue(selectedLoan).replace('%', '')),
                startDate: selectedLoan.disbursement_date || '',
                endDate: selectedLoan.maturity_date || '',
                status: (selectedLoan.loan_status as "active" | "completed" | "defaulted" || "active"),
                borrowerId: selectedLoan.borrower_id,
                borrowerEmail: selectedLoan.borrower?.email || '',
                borrowerPhone: '', // Add if available
                term: parseInt(getLoanTermValue(selectedLoan), 10) || 0
              }}
              onClose={() => setIsDetailsOpen(false)}
              onPrint={handlePrint}
              onEmail={handleEmail}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Loans;
