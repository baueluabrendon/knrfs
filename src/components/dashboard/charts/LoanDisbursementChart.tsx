
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { TimeSeriesData } from "@/lib/api/dashboard";

interface LoanDisbursementChartProps {
  data: TimeSeriesData[];
  timeFrame: string;
}

const LoanDisbursementChart = ({ data, timeFrame }: LoanDisbursementChartProps) => {
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
        <CardTitle>Loan Disbursements Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            <Area
              type="monotone"
              dataKey="total_principal"
              name="Principal Amount"
              stroke="#60a5fa"
              fill="#93c5fd"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LoanDisbursementChart;
