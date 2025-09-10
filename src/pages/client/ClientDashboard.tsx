
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useClientLoans, useClientRepayments, useClientNextPayment } from "@/hooks/useClientData";

const ClientDashboard = () => {
  const { user } = useAuth();
  const { data: loans, isLoading: loansLoading } = useClientLoans();
  const { data: recentRepayments } = useClientRepayments();
  const { data: nextPayment } = useClientNextPayment();

  if (loansLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalOutstanding = loans?.reduce((acc, loan) => acc + (loan.outstanding_balance || 0), 0) || 0;
  const totalRepaid = loans?.reduce((acc, loan) => acc + (loan.total_repayment || 0), 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.first_name || "Client"}</h1>
        <p className="text-muted-foreground mt-1">
          {loans?.length ? `You have ${loans.length} loan${loans.length > 1 ? 's' : ''} with us` : 'Welcome to your loan dashboard'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loans?.filter(loan => loan.loan_status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Repaid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalRepaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Payments made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${totalOutstanding.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Remaining balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {nextPayment ? new Date(nextPayment.due_date).toLocaleDateString() : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {nextPayment ? `$${nextPayment.repaymentrs?.toLocaleString()}` : 'No upcoming payments'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Loans</CardTitle>
          </CardHeader>
          <CardContent>
            {loans && loans.length > 0 ? (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <div key={loan.loan_id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{loan.loan_id}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className={`capitalize ${
                          loan.loan_status === 'active' ? 'text-green-600' : 
                          loan.loan_status === 'settled' ? 'text-blue-600' : 'text-orange-600'
                        }`}>{loan.loan_status}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Principal: ${loan.principal?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        ${loan.outstanding_balance?.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Outstanding</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No loans found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentRepayments && recentRepayments.length > 0 ? (
              <div className="space-y-4">
                {recentRepayments.map((repayment, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">${repayment.amount?.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(repayment.payment_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Loan: {repayment.loan_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        repayment.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : repayment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {repayment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent payments</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
