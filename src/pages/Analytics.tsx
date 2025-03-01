
import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Sample data - in a real app, this would come from an API
const generateSampleData = (period: string) => {
  const data = [];
  const points = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 12 : 4;
  
  for (let i = 0; i < points; i++) {
    data.push({
      name: `Point ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
    });
  }
  return data;
};

const reportTypes = [
  "Users Report",
  "Borrowers Report",
  "Applications Report",
  "Loans Report",
  "Repayment Report",
  "Recoveries Report"
];

const Analytics = () => {
  const [selectedReport, setSelectedReport] = useState(reportTypes[0]);
  const [timeFilter, setTimeFilter] = useState("month");
  const [chartData, setChartData] = useState(() => generateSampleData("month"));

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    setChartData(generateSampleData(value));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Select value={selectedReport} onValueChange={setSelectedReport}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            {reportTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="quarter">Quarter</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{selectedReport}</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
