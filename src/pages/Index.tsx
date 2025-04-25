
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import LoanDisbursementChart from "@/components/dashboard/charts/LoanDisbursementChart";
import RepaymentComparisonChart from "@/components/dashboard/charts/RepaymentComparisonChart";
import ArrearsChart from "@/components/dashboard/charts/ArrearsChart";
import InterestComparisonChart from "@/components/dashboard/charts/InterestComparisonChart";
import YearMonthSelect from "@/components/dashboard/YearMonthSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const currentYear = new Date().getFullYear();
  const [loanFilter, setLoanFilter] = useState<{ year: number; month?: number }>({ year: currentYear });
  const [repayFilter, setRepayFilter] = useState<{ year: number; month?: number }>({ year: currentYear });
  const [payrollType, setPayrollType] = useState<string>("All");

  // Determine the time frame based on whether a month is selected
  const loanTimeFrame = loanFilter.month ? "weekly" : "monthly";
  const repayTimeFrame = repayFilter.month ? "weekly" : "monthly";

  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: dashboardApi.getMetrics
  });

  const { data: loanData, isLoading: loadingLoanData } = useQuery({
    queryKey: ["loan-vs-repay", loanFilter, payrollType],
    queryFn: () => dashboardApi.getLoanVsRepayments({
      ...loanFilter,
      timeFrame: loanTimeFrame,
      payrollType: payrollType === "All" ? undefined : payrollType
    })
  });

  const { data: repayComp, isLoading: loadingRepayComp } = useQuery({
    queryKey: ["repay-comp", repayFilter, payrollType],
    queryFn: () => dashboardApi.getRepaymentComparison({
      ...repayFilter,
      timeFrame: repayTimeFrame,
      payrollType: payrollType === "All" ? undefined : payrollType
    })
  });

  const { data: arrearsData, isLoading: loadingArrearsData } = useQuery({
    queryKey: ["arrears-data", loanFilter, payrollType],
    queryFn: () => dashboardApi.getArrearsData({
      ...loanFilter,
      timeFrame: loanTimeFrame,
      payrollType: payrollType === "All" ? undefined : payrollType
    })
  });

  const { data: interestData, isLoading: loadingInterestData } = useQuery({
    queryKey: ["interest-comparison", loanFilter, payrollType],
    queryFn: () => dashboardApi.getInterestComparison({
      ...loanFilter,
      timeFrame: loanTimeFrame,
      payrollType: payrollType === "All" ? undefined : payrollType
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
        <h1 className="text

-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome to your loan management dashboard
        </p>
      </div>

      {metrics && <DashboardMetrics metrics={metrics} />}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Filters</h2>
        <div className="flex gap-4">
          <Select value={payrollType} onValueChange={setPayrollType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select payroll type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="public_servant">Public Servant</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Arrears Summary</h2>
          <YearMonthSelect {...loanFilter} onChange={setLoanFilter} />
        </div>
        {loadingArrearsData ? (
          <div className="flex h-[400px] items-center justify-center border rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : arrearsData && arrearsData.length > 0 ? (
          <ArrearsChart
            data={arrearsData}
            isWeekly={!!loanFilter.month}
          />
        ) : (
          <div className="flex h-[400px] items-center justify-center border rounded-lg">
            <p className="text-muted-foreground">No arrears data available</p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Interest Comparison</h2>
          <YearMonthSelect {...loanFilter} onChange={setLoanFilter} />
        </div>
        {loadingInterestData ? (
          <div className="flex h-[400px] items-center justify-center border rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : interestData && interestData.length > 0 ? (
          <InterestComparisonChart
            data={interestData}
            isWeekly={!!loanFilter.month}
          />
        ) : (
          <div className="flex h-[400px] items-center justify-center border rounded-lg">
            <p className="text-muted-foreground">No interest comparison data available</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
