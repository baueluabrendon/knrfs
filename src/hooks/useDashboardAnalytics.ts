import { useQuery } from '@tanstack/react-query';
import { analyticsApi, type AnalyticsData, type PieChartData } from '@/lib/api/analytics';

export const useDashboardAnalytics = (
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
  startDate?: string,
  endDate?: string,
  branchId?: string,
  clientType?: string,
  userRole?: string
) => {
  return useQuery({
    queryKey: ['dashboard-analytics', period, startDate, endDate, branchId, clientType, userRole],
    queryFn: () => analyticsApi.getAggregatedAnalyticsData(period, startDate, endDate, branchId, clientType, userRole),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Helper hooks with branch filtering support
export const useLoanStatusPieChart = (branchId?: string, userRole?: string) => {
  return useQuery({
    queryKey: ['loan-status-pie-chart', branchId, userRole],
    queryFn: () => analyticsApi.getLoanStatusPieChart(branchId, userRole),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGenderDistribution = (branchId?: string, userRole?: string) => {
  return useQuery({
    queryKey: ['gender-distribution', branchId, userRole],
    queryFn: () => analyticsApi.getGenderDistribution(branchId, userRole),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useClientsPerCompany = (branchId?: string, userRole?: string) => {
  return useQuery({
    queryKey: ['clients-per-company', branchId, userRole],
    queryFn: () => analyticsApi.getClientsPerCompany(branchId, userRole),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useDefaultsPerCompany = (branchId?: string, userRole?: string) => {
  return useQuery({
    queryKey: ['defaults-per-company', branchId, userRole],
    queryFn: () => analyticsApi.getDefaultsPerCompany(branchId, userRole),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Helper hook to format data for chart consumption
export const useFormattedAnalyticsData = (
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
  startDate?: string,
  endDate?: string,
  branchId?: string,
  clientType?: string,
  userRole?: string
) => {
  const { data, isLoading, error } = useDashboardAnalytics(period, startDate, endDate, branchId, clientType, userRole);

  const getTimeKey = () => {
    switch (period) {
      case 'daily': return 'day';
      case 'weekly': return 'week';
      case 'monthly': return 'month';
      case 'quarterly': return 'quarter';
      case 'yearly': return 'year';
      default: return 'month';
    }
  };

  const formatDataForCharts = (analyticsData: any[]) => {
    const timeKey = getTimeKey();

    // Sort data chronologically (oldest first) for proper 12-month display
    const sortedData = [...analyticsData].sort((a, b) => a.period_label.localeCompare(b.period_label));

    return {
      loanReleased: sortedData.map(item => ({
        [timeKey]: item.period_label,
        amount: Number(item.principal_released || 0)
      })),
      
      collections: sortedData.map(item => ({
        [timeKey]: item.period_label,
        amount: Number(item.total_collections || 0)
      })),
      
      collectionsVsRepayments: sortedData.map(item => ({
        [timeKey]: item.period_label,
        collections: Number(item.total_collections || 0),
        repaymentsDue: Number(item.total_due_amount || 0)
      })),
      
      collectionsVsReleased: sortedData.map(item => ({
        [timeKey]: item.period_label,
        collections: Number(item.total_collections || 0),
        loansReleased: Number(item.principal_released || 0)
      })),
      
      // Real-time outstanding balances for active loans
      outstandingLoans: sortedData.map(item => ({
        [timeKey]: item.period_label,
        amount: Number(item.total_outstanding || 0)
      })),
      
      // Fee collections from repayment_schedule data
      feesComparison: sortedData.map(item => ({
        [timeKey]: item.period_label,
        defaultFees: Number(item.default_fees_collected || 0),
        riskInsurance: Number(item.risk_insurance_collected || 0),
        docFees: Number(item.doc_fees_collected || 0)
      })),
      
      numberOfOpenLoans: sortedData.map(item => ({
        [timeKey]: item.period_label,
        count: Number(item.active_loans_count || 0)
      })),
      
      loansReleased: sortedData.map(item => ({
        [timeKey]: item.period_label,
        count: Number(item.loans_released_count || 0)
      })),
      
      repaymentsCollected: sortedData.map(item => ({
        [timeKey]: item.period_label,
        count: Number(item.repayments_collected_count || 0)
      })),
      
      fullyPaidLoans: sortedData.map(item => ({
        [timeKey]: item.period_label,
        count: Number(item.settled_loans_count || 0)
      })),
      
      newClients: sortedData.map(item => ({
        [timeKey]: item.period_label,
        count: Number(item.new_borrowers_count || 0)
      }))
    };
  };

  return {
    chartData: data ? formatDataForCharts(data) : null,
    isLoading,
    error
  };
};