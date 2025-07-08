
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import { Loader2, TrendingUp, Users, DollarSign } from "lucide-react";

const Dashboard = () => {
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_metrics_view')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
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
