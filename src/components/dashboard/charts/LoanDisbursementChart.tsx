
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { TimeSeriesData } from "@/lib/api/dashboard";

interface LoanDisbursementChartProps {
  data: TimeSeriesData[];
}

const LoanDisbursementChart = ({ data }: LoanDisbursementChartProps) => {
  const formatXAxis = (value: string) => {
    return format(new Date(value), "MMM yyyy");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Disbursements vs Repayments</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period_start" 
              tickFormatter={formatXAxis}
              minTickGap={30}
            />
            <YAxis 
              tickFormatter={formatCurrency}
            />
            <Tooltip
              labelFormatter={formatXAxis}
              formatter={(value) => [formatCurrency(value as number)]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total_principal"
              name="Loans Disbursed"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="total_amount"
              name="Repayments Collected"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LoanDisbursementChart;
