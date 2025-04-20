
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import LoanDisbursementChart from "@/components/dashboard/charts/LoanDisbursementChart";
import { Loader2 } from "lucide-react";

const Index = () => {
  const currentYear = new Date().getFullYear();

  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: dashboardApi.getMetrics
  });

  const { data: loanData } = useQuery({
    queryKey: ["loan-disbursements", currentYear],
    queryFn: () => dashboardApi.getLoanDisbursements(currentYear)
  });

  if (isLoadingMetrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to your loan management dashboard</p>
      </div>

      {metrics && <DashboardMetrics metrics={metrics} />}

      {loanData && (
        <div className="grid gap-6">
          <LoanDisbursementChart data={loanData} />
        </div>
      )}
    </div>
  );
};

export default Index;
