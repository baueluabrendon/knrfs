
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { useAuth } from '@/contexts/AuthContext';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { ClientTypeBreakdown } from '@/components/dashboard/ClientTypeBreakdown';
import { Loader2, TrendingUp, Users, DollarSign } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  
  const { 
    data: dashboardMetrics, 
    isLoading: metricsLoading, 
    error: metricsError 
  } = useQuery({
    queryKey: ['dashboard-metrics', user?.branch_id, user?.role],
    queryFn: () => dashboardApi.getDashboardMetrics(user?.branch_id, user?.role),
    staleTime: 5 * 60 * 1000,
    enabled: !!user, // Only run query when user is available
  });

  if (metricsLoading) {
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
      {dashboardMetrics && <DashboardMetrics metrics={dashboardMetrics} />}

      {/* Client Type Classification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientTypeBreakdown />
        {/* Placeholder for future components */}
        <div></div>
      </div>

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
