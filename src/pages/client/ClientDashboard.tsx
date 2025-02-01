import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const ClientDashboard = () => {
  const { user } = useAuth();

  const { data: loans, isLoading } = useQuery({
    queryKey: ['client-loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('borrower_id', user?.id);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.first_name || "Client"}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {loans?.filter(loan => loan.loan_status === 'active').length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Repaid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${loans?.reduce((acc, loan) => acc + (loan.total_payments || 0), 0).toLocaleString() || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {loans?.find(loan => loan.next_payment_date)?.next_payment_date || '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loans && loans.length > 0 ? (
            <div className="space-y-4">
              {loans.slice(0, 5).map((loan) => (
                <div key={loan.loan_id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Loan {loan.loan_id}</p>
                    <p className="text-sm text-gray-500">Status: {loan.loan_status}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    ${loan.loan_amount?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No loan activity found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;