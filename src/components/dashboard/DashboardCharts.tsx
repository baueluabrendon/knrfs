import React, { useState, useMemo } from 'react';
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

const DashboardCharts = () => {
  const [timeFilter, setTimeFilter] = useState('monthly');

  const filterOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'half-yearly', label: 'Half-Yearly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Calculate date range based on filter
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    
    switch (timeFilter) {
      case 'daily':
        start.setDate(end.getDate() - 30);
        break;
      case 'weekly':
        start.setDate(end.getDate() - 28 * 7);
        break;
      case 'monthly':
        start.setMonth(end.getMonth() - 12);
        break;
      case 'quarterly':
        start.setMonth(end.getMonth() - 12);
        break;
      case 'yearly':
        start.setFullYear(end.getFullYear() - 5);
        break;
      default:
        start.setMonth(end.getMonth() - 12);
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }, [timeFilter]);

  // Fetch real analytics data
  const { 
    chartData, 
    isLoading: analyticsLoading, 
    error: analyticsError 
  } = useFormattedAnalyticsData(
    timeFilter as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    dateRange.start,
    dateRange.end
  );

  // Fetch pie chart data
  const { data: loanStatusData, isLoading: loanStatusLoading } = useLoanStatusPieChart();
  const { data: genderData, isLoading: genderLoading } = useGenderDistribution();
  const { data: clientsPerCompanyData, isLoading: clientsLoading } = useClientsPerCompany();
  const { data: defaultsPerCompanyData, isLoading: defaultsLoading } = useDefaultsPerCompany();

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
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-medium">
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
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-medium">
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
    <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
      {data.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-sm" 
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-gray-700 font-medium">
            {entry.name}: {entry.value}%
          </span>
        </div>
      ))}
    </div>
  );

  // Loading state
  if (analyticsLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-600">Loading analytics data...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (analyticsError) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-red-600">Error loading analytics data</div>
        </div>
      </div>
    );
  }

  // No data state
  if (!chartData) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-600">No analytics data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
      {/* Filter Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Filter:</span>
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

      <div className="space-y-8">
        {/* Full Width Charts */}
        <div className="space-y-8">
          {/* Loan Released - Line Chart */}
          <Card className="p-6 shadow-md">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Loan Released - {getFilterLabel()}</h3>
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
          <Card className="p-6 shadow-md">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Loan Collections - {getFilterLabel()}</h3>
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
          <Card className="p-6 shadow-md">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Loan Collections vs Repayments Due - {getFilterLabel()}</h3>
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
          <Card className="p-6 shadow-md">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Loan Collections vs Loans Released - {getFilterLabel()}</h3>
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
          <Card className="p-6 shadow-md">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Total Outstanding Open Loans - {getFilterLabel()}</h3>
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
          <Card className="p-6 shadow-md">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Default Fees vs Loan Risk Insurance Fee vs Doc Fee Collections - {getFilterLabel()}</h3>
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
          <Card className="p-6 shadow-md">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Number of Open Loans - {getFilterLabel()}</h3>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Number of Loans Released - Bar Chart */}
          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Number of Loans Released - {getFilterLabel()}</h3>
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
          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Number of Repayments Collected - {getFilterLabel()}</h3>
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
          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Number of Fully Paid Loans - {getFilterLabel()}</h3>
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
          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Borrowers with First Loans - {getFilterLabel()}</h3>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {/* Open Loans Status */}
          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-gray-800 text-center">Open Loans Status</h3>
            {loanStatusLoading ? (
              <div className="flex justify-center items-center h-64">
                <span className="text-gray-500">Loading...</span>
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
          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-gray-800 text-center">Gender Distribution</h3>
            {genderLoading ? (
              <div className="flex justify-center items-center h-64">
                <span className="text-gray-500">Loading...</span>
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
          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-gray-800 text-center">Total Clients Per Company</h3>
            {clientsLoading ? (
              <div className="flex justify-center items-center h-64">
                <span className="text-gray-500">Loading...</span>
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
          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-gray-800 text-center">Defaults Per Company</h3>
            {defaultsLoading ? (
              <div className="flex justify-center items-center h-64">
                <span className="text-gray-500">Loading...</span>
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