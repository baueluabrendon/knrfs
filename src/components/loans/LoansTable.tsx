
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

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

interface LoansTableProps {
  loans: Loan[];
  loading: boolean;
  onSelectLoan: (loan: Loan) => void;
}

const LoansTable = ({ loans, loading, onSelectLoan }: LoansTableProps) => {
  
  const getBorrowerFullName = (loan: Loan) => {
    return loan.borrower ? `${loan.borrower.given_name} ${loan.borrower.surname}` : 'N/A';
  };

  const getStatusBadgeClass = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'settled':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-yellow-100 text-yellow-800';
      case 'written_off':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLoanTermValue = (loan: Loan) => {
    if (!loan.loan_term) return 'N/A';
    
    // Extract the numeric value from TERM_X format
    const termMatch = loan.loan_term.match(/TERM_(\d+)/);
    return termMatch ? `${termMatch[1]} bi-weekly` : loan.loan_term;
  };

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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>App ID</TableHead>
            <TableHead>Loan ID</TableHead>
            <TableHead>Borrower</TableHead>
            <TableHead>Loan Amount</TableHead>
            <TableHead>Interest</TableHead>
            <TableHead className="min-w-[120px]">Gross Loan</TableHead>
            <TableHead className="min-w-[120px]">Balance</TableHead>
            <TableHead>Loan Term (Fortnights)</TableHead>
            <TableHead>Fortnightly Installment</TableHead>
            <TableHead>Loan Status</TableHead>
            <TableHead>Repayment Status</TableHead>
            <TableHead>Arrears</TableHead>
            <TableHead>Default Fees</TableHead>
            <TableHead>Repayments</TableHead>
            <TableHead>Disbursement Date</TableHead>
            <TableHead>Start Repayment Date</TableHead>
            <TableHead>Maturity Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={17} className="text-center py-8 text-gray-500">
                No loans found
              </TableCell>
            </TableRow>
          ) : (
            loans.map((loan) => (
              <TableRow 
                key={loan.loan_id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onSelectLoan(loan)}
              >
                <TableCell>{loan.application_id || 'N/A'}</TableCell>
                <TableCell className="font-medium text-blue-600 hover:underline">
                  {loan.loan_id}
                </TableCell>
                <TableCell>{getBorrowerFullName(loan)}</TableCell>
                <TableCell>${loan.principal?.toLocaleString() || 'N/A'}</TableCell>
                <TableCell>${loan.interest?.toLocaleString() || 'N/A'}</TableCell>
                <TableCell className="whitespace-nowrap">${loan.gross_loan?.toLocaleString() || 'N/A'}</TableCell>
                <TableCell className="whitespace-nowrap">${loan.outstanding_balance?.toLocaleString() || '0'}</TableCell>
                <TableCell>{getLoanTermValue(loan)}</TableCell>
                <TableCell>${loan.fortnightly_installment?.toLocaleString() || 'N/A'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusBadgeClass(loan.loan_status)
                  }`}>
                    {loan.loan_status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusBadgeClass(loan.loan_repayment_status)
                  }`}>
                    {loan.loan_repayment_status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>${loan.arrears?.toLocaleString() || '0'}</TableCell>
                <TableCell>${loan.default_fees_accumulated?.toLocaleString() || '0'}</TableCell>
                <TableCell>${loan.total_repayment?.toLocaleString() || '0'}</TableCell>
                <TableCell>{formatDate(loan.disbursement_date)}</TableCell>
                <TableCell>{formatDate(loan.start_repayment_date)}</TableCell>
                <TableCell>{formatDate(loan.maturity_date)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LoansTable;
