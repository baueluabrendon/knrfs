
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { TimeSeriesData } from "@/lib/api/dashboard";

interface RepaymentComparisonChartProps {
  data: TimeSeriesData[];
  timeFrame: string;
}

const RepaymentComparisonChart = ({ data, timeFrame }: RepaymentComparisonChartProps) => {
  const formatXAxis = (value: string) => {
    if (!value) return '';
    try {
      const date = parseISO(value);
      switch (timeFrame) {
        case 'weekly':
        case 'fortnightly':
          return format(date, 'MMM d');
        case 'monthly':
          return format(date, 'MMM yyyy');
        case 'yearly':
          return format(date, 'yyyy');
        default:
          return format(date, 'MMM d');
      }
    } catch (e) {
      console.error("Date parsing error:", e, "for value:", value);
      return value;
    }
  };

  const chartData = data.map(item => ({
    ...item,
    scheduled_amount: Number(item.scheduled_amount || 0),
    actual_amount: Number(item.actual_amount || 0),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled vs Actual Repayments</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period_start" 
              tickFormatter={formatXAxis} 
              minTickGap={30}
            />
            <YAxis 
              tickFormatter={(value) => new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact',
              }).format(value)}
            />
            <Tooltip
              labelFormatter={(label) => formatXAxis(label as string)}
              formatter={(value) => [
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(value as number),
                value === 0 ? "No Data" : undefined
              ]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="scheduled_amount" 
              name="Scheduled" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 3 }} 
              activeDot={{ r: 5 }}
              connectNulls
            />
            <Line 
              type="monotone" 
              dataKey="actual_amount" 
              name="Actual" 
              stroke="#22c55e" 
              strokeWidth={2} 
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RepaymentComparisonChart;
