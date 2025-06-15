
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: dashboardApi.getMetrics
  });

  if (loadingMetrics) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome to your loan management dashboard
        </p>
      </div>

      {metrics && <DashboardMetrics metrics={metrics} />}
    </div>
  );
};

export default Dashboard;
