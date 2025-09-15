import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, User, Calendar, DollarSign, FileText, CreditCard, AlertTriangle, TrendingUp, MessageSquare, Shield, FolderOpen } from "lucide-react";
import { RepaymentSchedule } from "@/components/loans/RepaymentSchedule";
import AddRepaymentDialog from "@/components/loans/AddRepaymentDialog";

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
    mobile_number?: string;
    department_company?: string;
    file_number?: string;
  };
}

const LoanDetails = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddRepayment, setShowAddRepayment] = useState(false);

  useEffect(() => {
    if (loanId) {
      fetchLoan();
    }
  }, [loanId]);

  const fetchLoan = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          borrowers:borrower_id (
            given_name,
            surname,
            email,
            mobile_number,
            department_company,
            file_number
          )
        `)
        .eq('loan_id', loanId)
        .single();

      if (error) throw error;
      
      const loanData = {
        ...data,
        borrower: data.borrowers
      };
      
      setLoan(loanData as Loan);
    } catch (error) {
      console.error('Error fetching loan:', error);
      toast.error('Failed to load loan details');
    } finally {
      setLoading(false);
    }
  };

  const getBorrowerFullName = () => {
    if (!loan?.borrower) return 'N/A';
    return `${loan.borrower.given_name} ${loan.borrower.surname}`;
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

  const getInterestRateValue = () => {
    if (!loan?.interest_rate) return 'N/A';
    const rateMatch = loan.interest_rate.match(/RATE_(\d+)/);
    return rateMatch ? `${rateMatch[1]}%` : loan.interest_rate;
  };

  const getLoanTermValue = (): number => {
    if (!loan?.loan_term) return 0;
    const termMatch = loan.loan_term.match(/TERM_(\d+)/);
    return termMatch ? parseInt(termMatch[1], 10) : 0;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'K0.00';
    return `K${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/loans')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Loans
        </Button>
        <Card className="p-6">
          <p className="text-center text-gray-500">Loan not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/admin/loans')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Loans
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            View All Loans
          </Button>
          <Button>
            Borrower Loans Statement
          </Button>
        </div>
      </div>

      {/* Borrower Profile Card */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-gray-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{getBorrowerFullName()}</h1>
              <Badge className={getStatusBadgeClass(loan.loan_status)}>
                {loan.loan_status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Email:</strong> {loan.borrower?.email || 'N/A'}
              </div>
              <div>
                <strong>Mobile:</strong> {loan.borrower?.mobile_number || 'N/A'}
              </div>
              <div>
                <strong>File Number:</strong> {loan.borrower?.file_number || 'N/A'}
              </div>
              <div>
                <strong>Department:</strong> {loan.borrower?.department_company || 'N/A'}
              </div>
              <div>
                <strong>Loan Officer:</strong> System User
              </div>
              <div>
                <strong>Create Date:</strong> {formatDate(loan.disbursement_date)}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                Send Email
              </Button>
              <Button variant="outline" size="sm">
                Send PDF Files for E-Signature
              </Button>
              <Button variant="outline" size="sm">
                Send SMS
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Loan Summary Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-cyan-50">
                <th className="text-left p-2">Loan#</th>
                <th className="text-left p-2">Released</th>
                <th className="text-left p-2">Maturity</th>
                <th className="text-left p-2">Principal</th>
                <th className="text-left p-2">Interest Rate</th>
                <th className="text-left p-2">Interest</th>
                <th className="text-left p-2">Fees</th>
                <th className="text-left p-2">Penalty</th>
                <th className="text-left p-2">Due</th>
                <th className="text-left p-2">Paid</th>
                <th className="text-left p-2">Balance</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2 font-medium">{loan.loan_id}</td>
                <td className="p-2">{formatDate(loan.disbursement_date)}</td>
                <td className="p-2">{formatDate(loan.maturity_date)}</td>
                <td className="p-2">{formatCurrency(loan.principal)}</td>
                <td className="p-2">{getInterestRateValue()}</td>
                <td className="p-2">{formatCurrency(loan.interest)}</td>
                <td className="p-2">{formatCurrency(loan.documentation_fee + loan.loan_risk_insurance)}</td>
                <td className="p-2">{formatCurrency(loan.default_fees_accumulated)}</td>
                <td className="p-2">{formatCurrency(loan.gross_loan)}</td>
                <td className="p-2">{formatCurrency(loan.total_repayment)}</td>
                <td className="p-2">{formatCurrency(loan.outstanding_balance)}</td>
                <td className="p-2">
                  <Badge className={getStatusBadgeClass(loan.loan_repayment_status)}>
                    {loan.loan_repayment_status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="p-6">
        <Tabs defaultValue="repayments" className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11">
            <TabsTrigger value="repayments">
              <DollarSign className="h-4 w-4 mr-1" />
              Repayments
            </TabsTrigger>
            <TabsTrigger value="loan-terms">
              <FileText className="h-4 w-4 mr-1" />
              Loan Terms
            </TabsTrigger>
            <TabsTrigger value="loan-schedule">
              <Calendar className="h-4 w-4 mr-1" />
              Loan Schedule
            </TabsTrigger>
            <TabsTrigger value="pending-dues">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Pending Dues
            </TabsTrigger>
            <TabsTrigger value="penalty-settings">
              <Shield className="h-4 w-4 mr-1" />
              Penalty Settings
            </TabsTrigger>
            <TabsTrigger value="loan-collateral">
              <CreditCard className="h-4 w-4 mr-1" />
              Loan Collateral
            </TabsTrigger>
            <TabsTrigger value="expenses">
              <TrendingUp className="h-4 w-4 mr-1" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="other-income">
              <DollarSign className="h-4 w-4 mr-1" />
              Other Income
            </TabsTrigger>
            <TabsTrigger value="loan-files">
              <FolderOpen className="h-4 w-4 mr-1" />
              Loan Files
            </TabsTrigger>
            <TabsTrigger value="loan-comments">
              <MessageSquare className="h-4 w-4 mr-1" />
              Loan Comments
            </TabsTrigger>
            <TabsTrigger value="audit-logs">
              <FileText className="h-4 w-4 mr-1" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="repayments" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Repayment Schedule</h3>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setShowAddRepayment(true)}>Add Repayment</Button>
                  <Button variant="outline" size="sm">Show/Hide Columns</Button>
                  <Button variant="outline" size="sm">Bulk Delete</Button>
                </div>
              </div>
              <RepaymentSchedule 
                loan={{
                  id: loan.loan_id,
                  borrowerName: getBorrowerFullName(),
                  amount: loan.principal,
                  interestRate: parseFloat(getInterestRateValue().replace("%", "")),
                  term: getLoanTermValue(),
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="loan-terms" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Loan Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Loan ID:</span>
                    <span className="font-medium">{loan.loan_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Principal Amount:</span>
                    <span className="font-medium">{formatCurrency(loan.principal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="font-medium">{getInterestRateValue()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loan Term:</span>
                    <span className="font-medium">{getLoanTermValue()} fortnights</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fortnightly Installment:</span>
                    <span className="font-medium">{formatCurrency(loan.fortnightly_installment)}</span>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Repayment Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Repayment:</span>
                    <span className="font-medium">{formatCurrency(loan.total_repayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outstanding Balance:</span>
                    <span className="font-medium">{formatCurrency(loan.outstanding_balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion Percentage:</span>
                    <span className="font-medium">{loan.repayment_completion_percentage?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Arrears:</span>
                    <span className="font-medium">{formatCurrency(loan.arrears)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Default Fees:</span>
                    <span className="font-medium">{formatCurrency(loan.default_fees_accumulated)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="loan-schedule" className="mt-6">
            <RepaymentSchedule 
              loan={{
                id: loan.loan_id,
                borrowerName: getBorrowerFullName(),
                amount: loan.principal,
                interestRate: parseFloat(getInterestRateValue().replace("%", "")),
                term: getLoanTermValue(),
              }}
            />
          </TabsContent>

          <TabsContent value="pending-dues" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              Pending dues information will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="penalty-settings" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              Penalty settings will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="loan-collateral" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              Loan collateral information will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              Expenses information will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="other-income" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              Other income information will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="loan-files" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              Loan files will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="loan-comments" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              Loan comments will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="audit-logs" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              Audit logs will be displayed here
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Add Repayment Dialog */}
      <AddRepaymentDialog
        loanId={loan.loan_id}
        isOpen={showAddRepayment}
        onClose={() => setShowAddRepayment(false)}
        onRepaymentAdded={() => {
          // Refresh loan data after adding repayment
          fetchLoan();
        }}
      />
    </div>
  );
};

export default LoanDetails;