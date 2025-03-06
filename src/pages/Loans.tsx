import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LoanDetails from "@/components/loans/LoanDetails";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  due_date?: string;
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
  borrower?: {
    given_name: string;
    surname: string;
    email: string;
  };
}

const Loans = () => {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoans();
    
    const channel = supabase
      .channel('public:loans')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'loans' 
      }, () => {
        fetchLoans();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          borrower:borrower_id (
            given_name,
            surname,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    toast("Loan details have been emailed successfully.");
  };

  const getBorrowerFullName = (loan: Loan) => {
    return loan.borrower ? `${loan.borrower.given_name} ${loan.borrower.surname}` : 'N/A';
  };

  const getInterestRateValue = (loan: Loan) => {
    if (!loan.interest_rate) return 'N/A';
    const rateMatch = loan.interest_rate.match(/RATE_(\d+)/);
    return rateMatch ? `${rateMatch[1]}%` : loan.interest_rate;
  };

  const getLoanTermValue = (loan: Loan) => {
    if (!loan.loan_term) return 'N/A';
    const termMatch = loan.loan_term.match(/TERM_(\d+)/);
    return termMatch ? termMatch[1] : loan.loan_term;
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Loans Management</h1>
        <Button onClick={() => navigate("/admin/loans/add")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Loan
        </Button>
      </div>
      
      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : loans.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No loans found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Borrower Name</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Loan Term</TableHead>
                  <TableHead>Total Repayable</TableHead>
                  <TableHead>PVA</TableHead>
                  <TableHead>Disbursement Date</TableHead>
                  <TableHead>Maturity Date</TableHead>
                  <TableHead>Start Repayment Date</TableHead>
                  <TableHead>Repayment Status</TableHead>
                  <TableHead>Repayments</TableHead>
                  <TableHead>Outstanding Balance</TableHead>
                  <TableHead>Completion %</TableHead>
                  <TableHead>Default Fees</TableHead>
                  <TableHead>Missed Payments</TableHead>
                  <TableHead>Partial Payments</TableHead>
                  <TableHead>Loan Status</TableHead>
                  <TableHead>Refinanced By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow 
                    key={loan.loan_id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setSelectedLoan(loan);
                      setIsDetailsOpen(true);
                    }}
                  >
                    <TableCell className="font-medium text-blue-600 hover:underline">
                      {loan.loan_id}
                    </TableCell>
                    <TableCell>{getBorrowerFullName(loan)}</TableCell>
                    <TableCell>${loan.principal?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>${loan.interest?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>{getInterestRateValue(loan)}</TableCell>
                    <TableCell>{getLoanTermValue(loan)}</TableCell>
                    <TableCell>${loan.gross_loan?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>${loan.fortnightly_installment?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>{formatDate(loan.disbursement_date)}</TableCell>
                    <TableCell>{formatDate(loan.maturity_date)}</TableCell>
                    <TableCell>{formatDate(loan.due_date)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getStatusBadgeClass(loan.loan_repayment_status)
                      }`}>
                        {loan.loan_repayment_status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>${loan.total_repayment?.toLocaleString() || '0'}</TableCell>
                    <TableCell>${loan.outstanding_balance?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>{loan.repayment_completion_percentage?.toFixed(2) || '0'}%</TableCell>
                    <TableCell>${loan.default_fees_accumulated?.toLocaleString() || '0'}</TableCell>
                    <TableCell>{loan.missed_payments_count || '0'}</TableCell>
                    <TableCell>{loan.partial_payments_count || '0'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getStatusBadgeClass(loan.loan_status)
                      }`}>
                        {loan.loan_status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>{loan.refinanced_by || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
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
