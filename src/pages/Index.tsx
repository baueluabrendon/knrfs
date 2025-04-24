
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import LoanDisbursementChart from "@/components/dashboard/charts/LoanDisbursementChart";
import RepaymentComparisonChart from "@/components/dashboard/charts/RepaymentComparisonChart";
import YearMonthSelect from "@/components/dashboard/YearMonthSelect";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const currentYear = new Date().getFullYear();
  const [loanFilter, setLoanFilter] = useState<{ year: number; month?: number }>({ year: currentYear });
  const [repayFilter, setRepayFilter] = useState<{ year: number; month?: number }>({ year: currentYear });

  // Determine the time frame based on whether a month is selected
  const loanTimeFrame = loanFilter.month ? "weekly" : "monthly";
  const repayTimeFrame = repayFilter.month ? "weekly" : "monthly";

  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: dashboardApi.getMetrics
  });

  const { data: loanData, isLoading: loadingLoanData } = useQuery({
    queryKey: ["loan-vs-repay", loanFilter],
    queryFn: () => dashboardApi.getLoanVsRepayments({
      ...loanFilter,
      timeFrame: loanTimeFrame
    })
  });

  const { data: repayComp, isLoading: loadingRepayComp } = useQuery({
    queryKey: ["repay-comp", repayFilter],
    queryFn: () => dashboardApi.getRepaymentComparison({
      ...repayFilter,
      timeFrame: repayTimeFrame
    })
  });

  useEffect(() => {
    console.log("Loan filter:", loanFilter);
    console.log("Loan time frame:", loanTimeFrame);
    console.log("Loan chart data:", loanData);
    
    console.log("Repayment filter:", repayFilter);
    console.log("Repayment time frame:", repayTimeFrame);
    console.log("Repayment chart data:", repayComp);
  }, [loanData, repayComp, loanFilter, repayFilter, loanTimeFrame, repayTimeFrame]);

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
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Loan Disbursements vs Repayments</h2>
          <YearMonthSelect {...loanFilter} onChange={setLoanFilter} />
        </div>
        {loadingLoanData ? (
          <div className="flex h-[400px] items-center justify-center border rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : loanData && loanData.length > 0 ? (
          <LoanDisbursementChart
            data={loanData}
            isWeekly={!!loanFilter.month}
          />
        ) : (
          <div className="flex h-[400px] items-center justify-center border rounded-lg">
            <p className="text-muted-foreground">No loan disbursement data available</p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Scheduled vs Actual Repayments</h2>
          <YearMonthSelect {...repayFilter} onChange={setRepayFilter} />
        </div>
        {loadingRepayComp ? (
          <div className="flex h-[400px] items-center justify-center border rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : repayComp && repayComp.length > 0 ? (
          <RepaymentComparisonChart
            data={repayComp}
            timeFrame={repayTimeFrame}
          />
        ) : (
          <div className="flex h-[400px] items-center justify-center border rounded-lg">
            <p className="text-muted-foreground">No repayment comparison data available</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
