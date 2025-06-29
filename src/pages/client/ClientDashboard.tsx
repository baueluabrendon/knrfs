
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, Clock, DollarSign, FileText } from "lucide-react";

const ClientDashboard = () => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeLoans = loans?.filter(loan => loan.loan_status === 'active').length || 0;
  const totalRepaid = loans?.reduce((acc, loan) => acc + (loan.total_repayment || 0), 0) || 0;
  const nextPaymentDate = loans?.find(loan => loan.start_repayment_date)?.start_repayment_date;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.first_name || "Client"}</h1>
        <p className="text-blue-100 text-lg">Manage your loans and track your financial progress</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Loans</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeLoans}</div>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Repaid</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              K{totalRepaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total payments made</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Next Payment</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {nextPaymentDate ? new Date(nextPaymentDate).toLocaleDateString() : '-'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Due date</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Portfolio Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-gray-500 mt-1">Account standing</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loans && loans.length > 0 ? (
              <div className="space-y-4">
                {loans.slice(0, 5).map((loan) => (
                  <div key={loan.loan_id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Loan {loan.loan_id}</p>
                      <p className="text-sm text-gray-500">Status: <span className="capitalize">{loan.loan_status}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        K{loan.principal?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Principal</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No loan activity found</p>
                <p className="text-sm text-gray-400 mt-1">Your loans will appear here once created</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                <div className="flex items-center">
                  <FileSignature className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Apply for New Loan</p>
                    <p className="text-sm text-gray-500">Start a new loan application</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Make Payment</p>
                    <p className="text-sm text-gray-500">Pay your loan installment</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">View Statements</p>
                    <p className="text-sm text-gray-500">Download loan statements</p>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
