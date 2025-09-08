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

export const useLoanStatusPieChart = () => {
  return useQuery({
    queryKey: ['loan-status-pie-chart'],
    queryFn: () => analyticsApi.getLoanStatusPieChart(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGenderDistribution = () => {
  return useQuery({
    queryKey: ['gender-distribution'],
    queryFn: () => analyticsApi.getGenderDistribution(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useClientsPerCompany = () => {
  return useQuery({
    queryKey: ['clients-per-company'],
    queryFn: () => analyticsApi.getClientsPerCompany(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useDefaultsPerCompany = () => {
  return useQuery({
    queryKey: ['defaults-per-company'],
    queryFn: () => analyticsApi.getDefaultsPerCompany(),
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

    return {
      loanReleased: analyticsData.map(item => ({
        [timeKey]: item.period_label,
        amount: Number(item.principal_released)
      })),
      
      collections: analyticsData.map(item => ({
        [timeKey]: item.period_label,
        amount: Number(item.total_collections)
      })),
      
      collectionsVsRepayments: analyticsData.map(item => ({
        [timeKey]: item.period_label,
        collections: Number(item.total_collections),
        repaymentsDue: Number(item.total_due_amount)
      })),
      
      collectionsVsReleased: analyticsData.map(item => ({
        [timeKey]: item.period_label,
        collections: Number(item.total_collections),
        loansReleased: Number(item.principal_released)
      })),
      
      outstandingLoans: analyticsData.map(item => ({
        [timeKey]: item.period_label,
        amount: Number(item.total_outstanding)
      })),
      
      feesComparison: analyticsData.map(item => ({
        [timeKey]: item.period_label,
        defaultFees: Number(item.total_default_amount || 0),
        riskInsurance: Number(item.risk_insurance_collected),
        docFees: Number(item.doc_fees_collected)
      })),
      
      numberOfOpenLoans: analyticsData.map(item => ({
        [timeKey]: item.period_label,
        count: Number(item.active_loans_count)
      })),
      
      loansReleased: analyticsData.map(item => ({
        [timeKey]: item.period_label,
        count: Number(item.loans_released_count)
      })),
      
      repaymentsCollected: analyticsData.map(item => ({
        [timeKey]: item.period_label,
        count: Number(item.repayments_collected_count)
      })),
      
      fullyPaidLoans: analyticsData.map(item => ({
        [timeKey]: item.period_label,
        count: Number(item.settled_loans_count)
      })),
      
      newClients: analyticsData.map(item => ({
        [timeKey]: item.period_label,
        count: Number(item.new_borrowers_count)
      }))
    };
  };

  return {
    chartData: data ? formatDataForCharts(data) : null,
    isLoading,
    error
  };
};