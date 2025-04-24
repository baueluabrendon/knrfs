
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
import { format, parseISO } from "date-fns";
import { TimeSeriesData } from "@/lib/api/dashboard";

interface LoanDisbursementChartProps {
  data: TimeSeriesData[];
  isWeekly: boolean;
}

const LoanDisbursementChart = ({ data, isWeekly }: LoanDisbursementChartProps) => {
  const formatXAxis = (value: string) => {
    if (!value) return '';
    try {
      const date = parseISO(value);
      return isWeekly ? format(date, "d MMM") : format(date, "MMM yyyy");
    } catch (e) {
      console.error("Date parsing error:", e, "for value:", value);
      return value;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: value > 1000 ? "compact" : "standard",
    }).format(value);
  };

  // Clean and normalize data
  const chartData = data.map(item => ({
    ...item,
    total_principal: Number(item.total_principal || 0),
    actual_amount: Number(item.actual_amount || 0),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Disbursements vs Repayments</CardTitle>
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
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip
              labelFormatter={formatXAxis}
              formatter={(value) => [formatCurrency(value as number), value === 0 ? "No Data" : undefined]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total_principal"
              name="Loans Disbursed"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="actual_amount"
              name="Repayments Collected"
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

export default LoanDisbursementChart;
