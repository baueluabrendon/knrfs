
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
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { TimeSeriesData } from "@/lib/api/dashboard";

interface ArrearsChartProps {
  data: TimeSeriesData[];
  isWeekly: boolean;
}

const ArrearsChart = ({ data, isWeekly }: ArrearsChartProps) => {
  const formatXAxis = (value: string) => {
    if (!value) return '';
    try {
      const date = parseISO(value);
      
      if (isWeekly) {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        return `${format(weekStart, "MMM d")}-${format(weekEnd, "d")}`;
      }
      
      return format(date, "MMM yyyy");
    } catch (e) {
      console.error("Date parsing error:", e, "for value:", value);
      return value;
    }
  };

  const formatTooltipLabel = (label: string) => {
    if (!label) return '';
    try {
      const date = parseISO(label);
      
      if (isWeekly) {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        return `Week of ${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`;
      }
      
      return format(date, "MMMM yyyy");
    } catch (e) {
      console.error("Tooltip label parsing error:", e);
      return label;
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
    total_arrears: Number(item.total_arrears || 0)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arrears Summary</CardTitle>
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
              labelFormatter={formatTooltipLabel}
              formatter={(value) => [formatCurrency(value as number), value === 0 ? "No Data" : undefined]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total_arrears"
              name="Total Arrears"
              stroke="#ef4444"
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

export default ArrearsChart;
