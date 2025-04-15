
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface MissedPaymentsFiltersProps {
  selectedYear: string;
  selectedMonth: string;
  selectedPayPeriod: string;
  selectedPayrollType: string;
  uniqueYears: string[];
  uniqueMonths: string[];
  uniquePayPeriods: string[];
  uniquePayrollTypes: string[];
  onYearChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onPayPeriodChange: (value: string) => void;
  onPayrollTypeChange: (value: string) => void;
  onExport: () => void;
}

export const MissedPaymentsFilters = ({
  selectedYear,
  selectedMonth,
  selectedPayPeriod,
  selectedPayrollType,
  uniqueYears,
  uniqueMonths,
  uniquePayPeriods,
  uniquePayrollTypes,
  onYearChange,
  onMonthChange,
  onPayPeriodChange,
  onPayrollTypeChange,
  onExport,
}: MissedPaymentsFiltersProps) => {
  return (
    <div className="flex gap-4 flex-wrap">
      <Select value={selectedYear} onValueChange={onYearChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="All Years" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Years</SelectItem>
          {uniqueYears.map((y) => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={selectedMonth} 
        onValueChange={onMonthChange} 
        disabled={selectedMonth === "None"}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="All Months" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Months</SelectItem>
          {uniqueMonths.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedPayPeriod} onValueChange={onPayPeriodChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Pay Periods" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Pay Periods</SelectItem>
          {uniquePayPeriods.map((p) => (
            <SelectItem key={p} value={p}>{p}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedPayrollType} onValueChange={onPayrollTypeChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Payroll Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Payroll Types</SelectItem>
          {uniquePayrollTypes.map((pt) => (
            <SelectItem key={pt} value={pt}>{pt}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={onExport} variant="outline">
        Download CSV
      </Button>
    </div>
  );
};
