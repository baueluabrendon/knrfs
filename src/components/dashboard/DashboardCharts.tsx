
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Generate sample data based on filter type
const generateSampleData = (type: string, filter: string) => {
  let timeLabels: string[] = [];
  
  switch (filter) {
    case 'daily':
      // Generate days 1-30 for current month
      timeLabels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
      break;
    case 'weekly':
      // Generate 4 weeks per month for current year (48 weeks)
      timeLabels = Array.from({ length: 48 }, (_, i) => {
        const month = Math.floor(i / 4) + 1;
        const week = (i % 4) + 1;
        return `M${month}W${week}`;
      });
      break;
    case 'monthly':
      timeLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      break;
    case 'yearly':
      // Last 5 years to current year
      const currentYear = new Date().getFullYear();
      timeLabels = Array.from({ length: 6 }, (_, i) => `${currentYear - 5 + i}`);
      break;
    default:
      timeLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }
  
  return timeLabels.map(label => {
    const baseMultiplier = filter === 'yearly' ? 12 : filter === 'weekly' ? 0.25 : 1;
    
    switch (type) {
      case 'loanReleased':
        return { [getTimeKey(filter)]: label, amount: Math.floor(Math.random() * 500000 * baseMultiplier) + 100000 };
      case 'collections':
        return { [getTimeKey(filter)]: label, amount: Math.floor(Math.random() * 400000 * baseMultiplier) + 80000 };
      case 'collectionsVsRepayments':
        return {
          [getTimeKey(filter)]: label,
          collections: Math.floor(Math.random() * 400000 * baseMultiplier) + 80000,
          repaymentsDue: Math.floor(Math.random() * 450000 * baseMultiplier) + 90000
        };
      case 'collectionsVsReleased':
        return {
          [getTimeKey(filter)]: label,
          collections: Math.floor(Math.random() * 400000 * baseMultiplier) + 80000,
          loansReleased: Math.floor(Math.random() * 500000 * baseMultiplier) + 100000
        };
      case 'outstandingLoans':
        return { [getTimeKey(filter)]: label, amount: Math.floor(Math.random() * 2000000 * baseMultiplier) + 500000 };
      case 'feesComparison':
        return {
          [getTimeKey(filter)]: label,
          defaultFees: Math.floor(Math.random() * 50000 * baseMultiplier) + 10000,
          riskInsurance: Math.floor(Math.random() * 80000 * baseMultiplier) + 20000,
          docFees: Math.floor(Math.random() * 30000 * baseMultiplier) + 5000
        };
      case 'numberOfOpenLoans':
        return { [getTimeKey(filter)]: label, count: Math.floor(Math.random() * 500 * baseMultiplier) + 100 };
      case 'loansReleased':
        return { [getTimeKey(filter)]: label, count: Math.floor(Math.random() * 150 * baseMultiplier) + 30 };
      case 'repaymentsCollected':
        return { [getTimeKey(filter)]: label, count: Math.floor(Math.random() * 400 * baseMultiplier) + 80 };
      case 'fullyPaidLoans':
        return { [getTimeKey(filter)]: label, count: Math.floor(Math.random() * 200 * baseMultiplier) + 40 };
      case 'newClients':
        return { [getTimeKey(filter)]: label, count: Math.floor(Math.random() * 80 * baseMultiplier) + 20 };
      default:
        return { [getTimeKey(filter)]: label, value: 0 };
    }
  });
};

const getTimeKey = (filter: string) => {
  switch (filter) {
    case 'daily': return 'day';
    case 'weekly': return 'week';
    case 'monthly': return 'month';
    case 'yearly': return 'year';
    default: return 'month';
  }
};

// Updated pie chart data without percentage labels
const pieChartData = {
  loanStatus: [
    { name: 'Loans on Schedule', value: 45, color: '#22C55E' },
    { name: 'Due Today', value: 15, color: '#F59E0B' },
    { name: 'Missed Repayments', value: 12, color: '#EF4444' },
    { name: 'Partial Repayments', value: 10, color: '#F97316' },
    { name: 'Loans in Arrears', value: 13, color: '#DC2626' },
    { name: 'Past Maturity Date', value: 5, color: '#991B1B' }
  ],
  gender: [
    { name: 'Male', value: 55, color: '#3B82F6' },
    { name: 'Female', value: 45, color: '#EC4899' }
  ],
  clientsPerCompany: [
    { name: 'Public Service', value: 40, color: '#10B981' },
    { name: 'Statutory Bodies', value: 35, color: '#6366F1' },
    { name: 'Private Companies', value: 25, color: '#F59E0B' }
  ],
  defaultsPerCompany: [
    { name: 'Public Service', value: 30, color: '#EF4444' },
    { name: 'Statutory Bodies', value: 40, color: '#DC2626' },
    { name: 'Private Companies', value: 30, color: '#991B1B' }
  ]
};

const DashboardCharts = () => {
  const [timeFilter, setTimeFilter] = useState('monthly');

  const filterOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const getFilterLabel = () => {
    return filterOptions.find(option => option.value === timeFilter)?.label || 'Monthly';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Legend component for pie charts
  const PieChartLegend = ({ data }: { data: any[] }) => (
    <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
      {data.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded" 
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-gray-700">
            {entry.name}: {entry.value}%
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Filter Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filter:</span>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
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
        <div className="space-y-6">
          {/* Loan Released - Line Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Loan Released - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={generateSampleData('loanReleased', timeFilter)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getTimeKey(timeFilter)} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="#DC2626" strokeWidth={3} dot={{ fill: '#DC2626', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Loan Collections - Line Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Loan Collections - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={generateSampleData('collections', timeFilter)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getTimeKey(timeFilter)} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="#0EA5E9" strokeWidth={3} dot={{ fill: '#0EA5E9', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Collections vs Repayments Due - Line Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Loan Collections vs Repayments Due - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={generateSampleData('collectionsVsRepayments', timeFilter)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getTimeKey(timeFilter)} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="collections" stroke="#0EA5E9" strokeWidth={3} name="Collections" />
                <Line type="monotone" dataKey="repaymentsDue" stroke="#DC2626" strokeWidth={3} name="Repayments Due" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Collections vs Loans Released - Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Loan Collections vs Loans Released - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={generateSampleData('collectionsVsReleased', timeFilter)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getTimeKey(timeFilter)} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="collections" fill="#0EA5E9" name="Collections" />
                <Bar dataKey="loansReleased" fill="#DC2626" name="Loans Released" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Total Outstanding Open Loans - Line Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Total Outstanding Open Loans - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={generateSampleData('outstandingLoans', timeFilter)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getTimeKey(timeFilter)} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="#DC2626" strokeWidth={3} dot={{ fill: '#DC2626', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Default Fees vs Loan Risk Insurance vs Doc Fee Collections - Line Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Default Fees vs Loan Risk Insurance Fee vs Doc Fee Collections - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={generateSampleData('feesComparison', timeFilter)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getTimeKey(timeFilter)} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="defaultFees" stroke="#DC2626" strokeWidth={2} name="Default Fees" />
                <Line type="monotone" dataKey="riskInsurance" stroke="#F59E0B" strokeWidth={2} name="Risk Insurance" />
                <Line type="monotone" dataKey="docFees" stroke="#10B981" strokeWidth={2} name="Doc Fees" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Number of Open Loans - Line Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Number of Open Loans - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={generateSampleData('numberOfOpenLoans', timeFilter)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getTimeKey(timeFilter)} />
                <YAxis />
                <Tooltip content={<CustomCountTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#0EA5E9" strokeWidth={3} dot={{ fill: '#0EA5E9', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Half Width Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Number of Loans Released - Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Number of Loans Released - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={generateSampleData('loansReleased', timeFilter)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getTimeKey(timeFilter)} />
                <YAxis />
                <Tooltip content={<CustomCountTooltip />} />
                <Bar dataKey="count" fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Number of Repayments Collected - Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Number of Repayments Collected - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={generateSampleData('repaymentsCollected', timeFilter)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getTimeKey(timeFilter)} />
                <YAxis />
                <Tooltip content={<CustomCountTooltip />} />
                <Bar dataKey="count" fill="#0EA5E9" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Number of Fully Paid Loans - Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Number of Fully Paid Loans - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={generateSampleData('fullyPaidLoans', timeFilter)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getTimeKey(timeFilter)} />
                <YAxis />
                <Tooltip content={<CustomCountTooltip />} />
                <Bar dataKey="count" fill="#0EA5E9" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Borrowers with First Loans - Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Borrowers with First Loans (New Clients) - {getFilterLabel()}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={generateSampleData('newClients', timeFilter)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getTimeKey(timeFilter)} />
                <YAxis />
                <Tooltip content={<CustomCountTooltip />} />
                <Bar dataKey="count" fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Open Loans Status - Pie Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Open Loans Status (To Date)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData.loanStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.loanStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <PieChartLegend data={pieChartData.loanStatus} />
          </Card>

          {/* Gender Chart - Pie Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData.gender}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.gender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <PieChartLegend data={pieChartData.gender} />
          </Card>

          {/* Total Clients per Company - Pie Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Total Clients per Company</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData.clientsPerCompany}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.clientsPerCompany.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <PieChartLegend data={pieChartData.clientsPerCompany} />
          </Card>

          {/* Defaults Per Company - Pie Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Defaults Per Company</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData.defaultsPerCompany}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.defaultsPerCompany.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <PieChartLegend data={pieChartData.defaultsPerCompany} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
