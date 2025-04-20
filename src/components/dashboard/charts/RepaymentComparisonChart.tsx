
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { TimeSeriesData } from "@/lib/api/dashboard";

interface RepaymentComparisonChartProps {
  data: TimeSeriesData[];
  timeFrame: string;
}

const RepaymentComparisonChart = ({ data, timeFrame }: RepaymentComparisonChartProps) => {
  const formatXAxis = (value: string) => {
    const date = new Date(value);
    switch (timeFrame) {
      case 'weekly':
      case 'fortnightly':
        return format(date, 'MMM d');
      case 'monthly':
        return format(date, 'MMM yyyy');
      case 'yearly':
        return format(date, 'yyyy');
      default:
        return value;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled vs Actual Repayments</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period_start" tickFormatter={formatXAxis} />
            <YAxis />
            <Tooltip
              labelFormatter={(label) => formatXAxis(label as string)}
              formatter={(value) => [
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(value as number),
              ]}
            />
            <Legend />
            <Line type="monotone" dataKey="scheduled_amount" name="Scheduled" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="actual_amount" name="Actual" stroke="#22c55e" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RepaymentComparisonChart;
