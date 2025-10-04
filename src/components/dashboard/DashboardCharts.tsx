import React, { useState, useMemo, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  useFormattedAnalyticsData, 
  useLoanStatusPieChart, 
  useGenderDistribution, 
  useClientsPerCompany, 
  useDefaultsPerCompany 
} from '@/hooks/useDashboardAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { BranchSelector } from './BranchSelector';
import { canViewAllBranches, shouldFilterByBranch } from '@/utils/roleBasedAccess';
import './DashboardCharts.css';

const DashboardCharts = () => {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');

  // Automatically set branch for users who should be filtered by branch
  useEffect(() => {
    if (shouldFilterByBranch(user) && user?.branch_id) {
      setSelectedBranchId(user.branch_id);
    }
  }, [user]);

  const filterOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'half-yearly', label: 'Half-Yearly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Calculate date range based on filter (current year/month focus)
  const dateRange = useMemo(() => {
    const now = new Date();
    const end = new Date();
    const start = new Date();
    
    switch (timeFilter) {
      case 'daily':
        // Show current month only
        start.setFullYear(now.getFullYear(), now.getMonth(), 1);
        end.setFullYear(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'weekly':
        // Show all weeks in current year
        start.setFullYear(now.getFullYear(), 0, 1);
        end.setFullYear(now.getFullYear(), 11, 31);
        break;
      case 'monthly':
        // Show all months in current year
        start.setFullYear(now.getFullYear(), 0, 1);
        end.setFullYear(now.getFullYear(), 11, 31);
        break;
      case 'quarterly':
        // Show all quarters in current year
        start.setFullYear(now.getFullYear(), 0, 1);
        end.setFullYear(now.getFullYear(), 11, 31);
        break;
      case 'half-yearly':
        // Show both halves of current year
        start.setFullYear(now.getFullYear(), 0, 1);
        end.setFullYear(now.getFullYear(), 11, 31);
        break;
      case 'yearly':
        // Show current year only
        start.setFullYear(now.getFullYear(), 0, 1);
        end.setFullYear(now.getFullYear(), 11, 31);
        break;
      default:
        start.setFullYear(now.getFullYear(), 0, 1);
        end.setFullYear(now.getFullYear(), 11, 31);
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }, [timeFilter]);

  // Determine which branch to filter by
  const effectiveBranchId = canViewAllBranches(user)
    ? (selectedBranchId === 'all' ? undefined : selectedBranchId)
    : user?.branch_id || undefined;

  // Fetch real analytics data
  const { 
    chartData, 
    isLoading: analyticsLoading, 
    error: analyticsError 
  } = useFormattedAnalyticsData(
    timeFilter as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'half-yearly',
    dateRange.start,
    dateRange.end,
    effectiveBranchId,
    undefined,
    user?.role
  );

  // Fetch pie chart data with branch filtering
  const { data: loanStatusData, isLoading: loanStatusLoading } = useLoanStatusPieChart(effectiveBranchId, user?.role);
  const { data: genderData, isLoading: genderLoading } = useGenderDistribution(effectiveBranchId, user?.role);
  const { data: clientsPerCompanyData, isLoading: clientsLoading } = useClientsPerCompany(effectiveBranchId, user?.role);
  const { data: defaultsPerCompanyData, isLoading: defaultsLoading } = useDefaultsPerCompany(effectiveBranchId, user?.role);

  const getFilterLabel = () => {
    return filterOptions.find(option => option.value === timeFilter)?.label || 'Monthly';
  };

  const getTimeKey = () => {
    switch (timeFilter) {
      case 'daily': return 'day';
      case 'weekly': return 'week';
      case 'monthly': return 'month';
      case 'quarterly': return 'quarter';
      case 'half-yearly': return 'halfYear';
      case 'yearly': return 'year';
      default: return 'month';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={index} 
              className="tooltip-entry"
              style={{ '--tooltip-color': entry.color } as React.CSSProperties}
            >
              {`${entry.dataKey}: ${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomCountTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={index} 
              className="tooltip-entry"
              style={{ '--tooltip-color': entry.color } as React.CSSProperties}
            >
              {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Legend component for pie charts
  const PieChartLegend = ({ data }: { data: any[] }) => (
    <div className="pie-chart-legend">
      {data.map((entry, index) => (
        <div key={index} className="legend-item">
          <div 
            className="legend-color-box"
            style={{ '--legend-color': entry.color } as React.CSSProperties}
          ></div>
          <span className="legend-text">
            {entry.name}: {entry.value}%
          </span>
        </div>
      ))}
    </div>
  );

  // Loading state
  if (analyticsLoading) {
    return (
      <div className="dashboard-charts">
        <div className="loading-container">
          <div className="loading-text">Loading analytics data...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (analyticsError) {
    return (
      <div className="dashboard-charts">
        <div className="loading-container">
          <div className="error-text">Error loading analytics data</div>
        </div>
      </div>
    );
  }

  // No data state
  if (!chartData) {
    return (
      <div className="dashboard-charts">
        <div className="loading-container">
          <div className="loading-text">No analytics data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-charts">
      {/* Filter Header */}
      <div className="dashboard-header">
        <h2 className="dashboard-title">Analytics Dashboard</h2>
        <div className="filter-container">
          <BranchSelector 
            selectedBranchId={selectedBranchId}
            onBranchChange={setSelectedBranchId}
          />
          <span className="filter-label">Period:</span>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="charts-space">{/* ... keep existing charts code */}
        {/* Full Width Charts */}
        <div className="charts-space">
          {/* Loan Released - Line Chart */}
          <Card className="chart-card">
            <h3 className="chart-title">Loan Released - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData.loanReleased} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={getTimeKey()} 
                  angle={timeFilter === 'daily' ? -45 : 0}
                  textAnchor={timeFilter === 'daily' ? 'end' : 'middle'}
                  height={timeFilter === 'daily' ? 80 : 60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="#DC2626" strokeWidth={3} dot={{ fill: '#DC2626', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Loan Collections - Line Chart */}
          <Card className="chart-card">
            <h3 className="chart-title">Loan Collections - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData.collections} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={getTimeKey()} 
                  angle={timeFilter === 'daily' ? -45 : 0}
                  textAnchor={timeFilter === 'daily' ? 'end' : 'middle'}
                  height={timeFilter === 'daily' ? 80 : 60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="#0EA5E9" strokeWidth={3} dot={{ fill: '#0EA5E9', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Collections vs Repayments Due - Line Chart */}
          <Card className="chart-card">
            <h3 className="chart-title">Loan Collections vs Repayments Due - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData.collectionsVsRepayments} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={getTimeKey()} 
                  angle={timeFilter === 'daily' ? -45 : 0}
                  textAnchor={timeFilter === 'daily' ? 'end' : 'middle'}
                  height={timeFilter === 'daily' ? 80 : 60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="collections" stroke="#0EA5E9" strokeWidth={3} name="Collections" />
                <Line type="monotone" dataKey="repaymentsDue" stroke="#DC2626" strokeWidth={3} name="Repayments Due" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Collections vs Loans Released - Bar Chart */}
          <Card className="chart-card">
            <h3 className="chart-title">Loan Collections vs Loans Released - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData.collectionsVsReleased} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={getTimeKey()} 
                  angle={timeFilter === 'daily' ? -45 : 0}
                  textAnchor={timeFilter === 'daily' ? 'end' : 'middle'}
                  height={timeFilter === 'daily' ? 80 : 60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="collections" fill="#0EA5E9" name="Collections" />
                <Bar dataKey="loansReleased" fill="#DC2626" name="Loans Released" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Total Outstanding Open Loans - Line Chart */}
          <Card className="chart-card">
            <h3 className="chart-title">Total Outstanding Open Loans - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData.outstandingLoans} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={getTimeKey()} 
                  angle={timeFilter === 'daily' ? -45 : 0}
                  textAnchor={timeFilter === 'daily' ? 'end' : 'middle'}
                  height={timeFilter === 'daily' ? 80 : 60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="#DC2626" strokeWidth={3} dot={{ fill: '#DC2626', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Default Fees vs Loan Risk Insurance vs Doc Fee Collections - Line Chart */}
          <Card className="chart-card">
            <h3 className="chart-title">Default Fees vs Loan Risk Insurance Fee vs Doc Fee Collections - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData.feesComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={getTimeKey()} 
                  angle={timeFilter === 'daily' ? -45 : 0}
                  textAnchor={timeFilter === 'daily' ? 'end' : 'middle'}
                  height={timeFilter === 'daily' ? 80 : 60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="defaultFees" stroke="#DC2626" strokeWidth={2} name="Default Fees" />
                <Line type="monotone" dataKey="riskInsurance" stroke="#F59E0B" strokeWidth={2} name="Risk Insurance" />
                <Line type="monotone" dataKey="docFees" stroke="#10B981" strokeWidth={2} name="Doc Fees" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Number of Open Loans - Line Chart */}
          <Card className="chart-card">
            <h3 className="chart-title">Number of Open Loans - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData.numberOfOpenLoans} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={getTimeKey()} 
                  angle={timeFilter === 'daily' ? -45 : 0}
                  textAnchor={timeFilter === 'daily' ? 'end' : 'middle'}
                  height={timeFilter === 'daily' ? 80 : 60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomCountTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#0EA5E9" strokeWidth={3} dot={{ fill: '#0EA5E9', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Half Width Charts */}
        <div className="charts-grid-half">
          {/* Number of Loans Released - Bar Chart */}
          <Card className="chart-card">
            <h3 className="chart-title-small">Number of Loans Released - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.loansReleased} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={getTimeKey()} 
                  angle={timeFilter === 'daily' ? -45 : 0}
                  textAnchor={timeFilter === 'daily' ? 'end' : 'middle'}
                  height={timeFilter === 'daily' ? 80 : 60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomCountTooltip />} />
                <Bar dataKey="count" fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Number of Repayments Collected - Bar Chart */}
          <Card className="chart-card">
            <h3 className="chart-title-small">Number of Repayments Collected - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.repaymentsCollected} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={getTimeKey()} 
                  angle={timeFilter === 'daily' ? -45 : 0}
                  textAnchor={timeFilter === 'daily' ? 'end' : 'middle'}
                  height={timeFilter === 'daily' ? 80 : 60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomCountTooltip />} />
                <Bar dataKey="count" fill="#0EA5E9" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Number of Fully Paid Loans - Bar Chart */}
          <Card className="chart-card">
            <h3 className="chart-title-small">Number of Fully Paid Loans - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.fullyPaidLoans} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={getTimeKey()} 
                  angle={timeFilter === 'daily' ? -45 : 0}
                  textAnchor={timeFilter === 'daily' ? 'end' : 'middle'}
                  height={timeFilter === 'daily' ? 80 : 60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomCountTooltip />} />
                <Bar dataKey="count" fill="#22C55E" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Borrowers with First Loans - Bar Chart */}
          <Card className="chart-card">
            <h3 className="chart-title-small">Borrowers with First Loans - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.newClients} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={getTimeKey()} 
                  angle={timeFilter === 'daily' ? -45 : 0}
                  textAnchor={timeFilter === 'daily' ? 'end' : 'middle'}
                  height={timeFilter === 'daily' ? 80 : 60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomCountTooltip />} />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Pie Charts - 4 columns */}
        <div className="charts-grid-pie">
          {/* Open Loans Status */}
          <Card className="chart-card">
            <h3 className="chart-title-small">Open Loans Status</h3>
            {loanStatusLoading ? (
              <div className="pie-chart-loading">
                <span className="pie-loading-text">Loading...</span>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={loanStatusData || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={false}
                    >
                      {(loanStatusData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {!loanStatusLoading && loanStatusData && <PieChartLegend data={loanStatusData} />}
              </>
            )}
          </Card>

          {/* Gender Distribution */}
          <Card className="chart-card">
            <h3 className="chart-title-small">Gender Distribution</h3>
            {genderLoading ? (
              <div className="pie-chart-loading">
                <span className="pie-loading-text">Loading...</span>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderData || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={false}
                    >
                      {(genderData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {!genderLoading && genderData && <PieChartLegend data={genderData} />}
              </>
            )}
          </Card>

          {/* Total Clients Per Company */}
          <Card className="chart-card">
            <h3 className="chart-title-small">Total Clients Per Company</h3>
            {clientsLoading ? (
              <div className="pie-chart-loading">
                <span className="pie-loading-text">Loading...</span>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={clientsPerCompanyData || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={false}
                    >
                      {(clientsPerCompanyData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {!clientsLoading && clientsPerCompanyData && <PieChartLegend data={clientsPerCompanyData} />}
              </>
            )}
          </Card>

          {/* Defaults Per Company */}
          <Card className="chart-card">
            <h3 className="chart-title-small">Defaults Per Company</h3>
            {defaultsLoading ? (
              <div className="pie-chart-loading">
                <span className="pie-loading-text">Loading...</span>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={defaultsPerCompanyData || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={false}
                    >
                      {(defaultsPerCompanyData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {!defaultsLoading && defaultsPerCompanyData && <PieChartLegend data={defaultsPerCompanyData} />}
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;