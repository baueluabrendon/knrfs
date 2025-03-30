
import { useState, useEffect, ChangeEvent } from "react";
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
import { Input } from "@/components/ui/input";
import LoanDetails from "@/components/loans/LoanDetails";
import { toast } from "sonner";
import { Plus, Loader2, Upload, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

const Loans = () => {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLoans(loans);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = loans.filter(loan => 
        loan.loan_id.toLowerCase().includes(query) || 
        (loan.borrower && 
          `${loan.borrower.given_name} ${loan.borrower.surname}`.toLowerCase().includes(query))
      );
      setFilteredLoans(filtered);
    }
  }, [searchQuery, loans]);

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
      setFilteredLoans(data || []);
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

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
    
    // Extract the numeric value from TERM_X format
    const termMatch = loan.loan_term.match(/TERM_(\d+)/);
    return termMatch ? `${termMatch[1]} months` : loan.loan_term;
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
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Loans Management</h1>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/admin/loans/bulk")} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Add Bulk Loans
          </Button>
          <Button onClick={() => navigate("/admin/loans/add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Loan
          </Button>
        </div>
      </div>
      
      <div className="flex items-center mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by name or loan ID..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9 pr-4"
          />
        </div>
        <div className="ml-2">
          {searchQuery && (
            <p className="text-sm text-gray-500">
              Showing {filteredLoans.length} of {loans.length} loans
            </p>
          )}
        </div>
      </div>
      
      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
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
                  <TableHead>Loan Term</TableHead>
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
                {filteredLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={17} className="text-center py-8 text-gray-500">
                      {searchQuery ? 'No matching loans found' : 'No loans found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoans.map((loan) => (
                    <TableRow 
                      key={loan.loan_id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedLoan(loan);
                        setIsDetailsOpen(true);
                      }}
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
