
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import { Loader2, TrendingUp, Users, DollarSign } from "lucide-react";

const Dashboard = () => {
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      // Get aggregated metrics from the new comprehensive view
      const { data, error } = await supabase
        .from('dashboard_analytics_with_branches')
        .select(`
          active_loans_count,
          settled_loans_count,
          at_risk_loans_count,
          pending_applications_count,
          principal_released,
          total_outstanding,
          total_collections,
          avg_loan_duration_days,
          total_arrears,
          total_default_fees,
          total_missed_payments,
          total_partial_payments,
          collection_efficiency_percentage,
          branch_name,
          branch_code
        `)
        .order('analysis_date', { ascending: false })
        .limit(30); // Get recent data for aggregation
      
      if (error) throw error;
      
      // Aggregate the metrics across all recent records
      if (!data || data.length === 0) {
        return {
          active_loans_count: 0,
          active_borrowers_count: 0,
          at_risk_loans_count: 0,
          pending_applications_count: 0,
          total_principal_amount: 0,
          total_outstanding_balance: 0,
          total_repayments_amount: 0,
          avg_loan_duration_days: 0,
          settled_loans_count: 0,
          total_arrears_amount: 0,
          total_default_fees: 0,
          loans_with_missed_payments: 0,
          loans_with_partial_payments: 0,
          collection_efficiency_percentage: 0
        };
      }

      // Sum up metrics from recent records
      const aggregated = data.reduce((acc, record) => ({
        active_loans_count: Math.max(acc.active_loans_count, record.active_loans_count || 0),
        active_borrowers_count: Math.max(acc.active_borrowers_count, record.active_loans_count || 0), // Using loans as proxy
        at_risk_loans_count: Math.max(acc.at_risk_loans_count, record.at_risk_loans_count || 0),
        pending_applications_count: Math.max(acc.pending_applications_count, record.pending_applications_count || 0),
        total_principal_amount: acc.total_principal_amount + (record.principal_released || 0),
        total_outstanding_balance: Math.max(acc.total_outstanding_balance, record.total_outstanding || 0),
        total_repayments_amount: acc.total_repayments_amount + (record.total_collections || 0),
        avg_loan_duration_days: Math.max(acc.avg_loan_duration_days, record.avg_loan_duration_days || 0),
        settled_loans_count: Math.max(acc.settled_loans_count, record.settled_loans_count || 0),
        total_arrears_amount: Math.max(acc.total_arrears_amount, record.total_arrears || 0),
        total_default_fees: Math.max(acc.total_default_fees, record.total_default_fees || 0),
        loans_with_missed_payments: Math.max(acc.loans_with_missed_payments, record.total_missed_payments || 0),
        loans_with_partial_payments: Math.max(acc.loans_with_partial_payments, record.total_partial_payments || 0),
        collection_efficiency_percentage: Math.max(acc.collection_efficiency_percentage, record.collection_efficiency_percentage || 0)
      }), {
        active_loans_count: 0,
        active_borrowers_count: 0,
        at_risk_loans_count: 0,
        pending_applications_count: 0,
        total_principal_amount: 0,
        total_outstanding_balance: 0,
        total_repayments_amount: 0,
        avg_loan_duration_days: 0,
        settled_loans_count: 0,
        total_arrears_amount: 0,
        total_default_fees: 0,
        loans_with_missed_payments: 0,
        loans_with_partial_payments: 0,
        collection_efficiency_percentage: 0
      });

      return aggregated;
    }
  });

  if (loadingMetrics) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">
              Welcome to your comprehensive loan management dashboard
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Performance</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Borrowers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Finance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Metrics */}
      {metrics && <DashboardMetrics metrics={metrics} />}

      {/* Dashboard Charts */}
      <DashboardCharts />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">Add New Borrower</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Register a new borrower in the system</p>
          </button>
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">Process Loan</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Create and process a new loan application</p>
          </button>
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-gray-900">View Reports</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Access detailed analytics and reports</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
