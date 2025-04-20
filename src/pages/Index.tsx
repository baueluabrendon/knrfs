
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import LoanDisbursementChart from "@/components/dashboard/charts/LoanDisbursementChart";
import RepaymentLineChart from "@/components/dashboard/charts/RepaymentLineChart";
import YearMonthSelect from "@/components/dashboard/YearMonthSelect";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [filter, setFilter] = useState<{ year: number; month?: number }>({ 
    year: new Date().getFullYear() 
  });
  
  const timeFrame = filter.month ? "weekly" : "monthly";

  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: dashboardApi.getMetrics
  });

  const { data: loanData } = useQuery({
    queryKey: ["loan-disbursements", filter.year, filter.month],
    queryFn: () => dashboardApi.getLoanDisbursements(filter.year, filter.month)
  });

  const { data: repaymentData } = useQuery({
    queryKey: ["repayment-comparison", filter.year, filter.month],
    queryFn: () => dashboardApi.getRepaymentComparison(filter.year, filter.month)
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

      <YearMonthSelect {...filter} onChange={setFilter} />

      <div className="grid gap-6">
        {loanData && (
          <LoanDisbursementChart 
            data={loanData} 
            isWeekly={!!filter.month} 
          />
        )}
        {repaymentData && (
          <RepaymentLineChart 
            data={repaymentData} 
            isWeekly={!!filter.month} 
          />
        )}
      </div>
    </div>
  );
};

export default Index;
