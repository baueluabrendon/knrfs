
// Replace entire file with the provided code
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import LoanDisbursementChart from "@/components/dashboard/charts/LoanDisbursementChart";
import RepaymentComparisonChart from "@/components/dashboard/charts/RepaymentComparisonChart";
import YearMonthSelect from "@/components/dashboard/YearMonthSelect";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const [loanFilter, setLoanFilter] = useState<{ year: number; month?: number }>({ year: new Date().getFullYear() });
  const [repayFilter, setRepayFilter] = useState<{ year: number; month?: number }>({ year: new Date().getFullYear() });

  const loanTimeFrame = loanFilter.month ? "weekly" : "monthly";
  const repayTimeFrame = repayFilter.month ? "weekly" : "monthly";

  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: dashboardApi.getMetrics
  });

  const { data: loanData } = useQuery({
    queryKey: ["loan-vs-repay", loanFilter],
    queryFn: () => dashboardApi.getLoanVsRepayments({
      ...loanFilter,
      timeFrame: loanTimeFrame
    })
  });

  const { data: repayComp } = useQuery({
    queryKey: ["repay-comp", repayFilter],
    queryFn: () => dashboardApi.getRepaymentComparison({
      ...repayFilter,
      timeFrame: repayTimeFrame
    })
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

      <section className="space-y-4">
        <YearMonthSelect {...loanFilter} onChange={setLoanFilter} />
        {loanData && (
          <LoanDisbursementChart
            data={loanData}
            isWeekly={!!loanFilter.month}
          />
        )}
      </section>

      <section className="space-y-4">
        <YearMonthSelect {...repayFilter} onChange={setRepayFilter} />
        {repayComp && (
          <RepaymentComparisonChart
            data={repayComp}
            timeFrame={repayTimeFrame}
          />
        )}
      </section>
    </div>
  );
};

export default Dashboard;
