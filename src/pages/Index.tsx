
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import TimeFrameSelect from "@/components/dashboard/TimeFrameSelect";
import RepaymentComparisonChart from "@/components/dashboard/charts/RepaymentComparisonChart";
import LoanDisbursementChart from "@/components/dashboard/charts/LoanDisbursementChart";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [timeFrame, setTimeFrame] = useState("monthly");

  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: dashboardApi.getMetrics
  });

  const { data: repaymentData } = useQuery({
    queryKey: ["repayment-comparison", timeFrame],
    queryFn: () => dashboardApi.getRepaymentComparison(timeFrame)
  });

  const { data: loanData } = useQuery({
    queryKey: ["loan-disbursements", timeFrame],
    queryFn: () => dashboardApi.getLoanDisbursements(timeFrame)
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

      <div className="flex justify-end">
        <TimeFrameSelect value={timeFrame} onValueChange={setTimeFrame} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {repaymentData && (
          <RepaymentComparisonChart
            data={repaymentData}
            timeFrame={timeFrame}
          />
        )}
        {loanData && (
          <LoanDisbursementChart
            data={loanData}
            timeFrame={timeFrame}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
