
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { MissedPaymentsFilters } from "@/components/missed-payments/MissedPaymentsFilters";
import { PartialPaymentsTable } from "@/components/partial-payments/PartialPaymentsTable";
import { usePartialPayments } from "@/hooks/usePartialPayments";
import { parseISO, isValid, format } from "date-fns";

const PartialPayments = () => {
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedPayPeriod, setSelectedPayPeriod] = useState("All");
  const [selectedPayrollType, setSelectedPayrollType] = useState("All");

  const { data: queryData, isLoading } = usePartialPayments();
  const { data = [], uniqueYears = [], uniqueMonths = [], uniquePayPeriods = [], uniquePayrollTypes = [] } = queryData || {};

  const filtered = useMemo(() => {
    const filteredSet = new Map();

    for (const r of data) {
      const date = parseISO(r.paymentDate);
      if (!isValid(date)) continue;

      const year = format(date, "yyyy");
      const month = format(date, "MMMM");

      const match =
        (selectedYear === "All" || year === selectedYear) &&
        (selectedMonth === "All" || selectedMonth === "None" || month === selectedMonth) &&
        (selectedPayPeriod === "All" || r.payPeriod === selectedPayPeriod) &&
        (selectedPayrollType === "All" || r.payrollType === selectedPayrollType);

      if (match) {
        const key = `${r.loanId}-${r.payPeriod}`;
        if (!filteredSet.has(key)) {
          filteredSet.set(key, r);
        }
      }
    }

    return Array.from(filteredSet.values()).sort(
      (a, b) => parseISO(b.paymentDate).getTime() - parseISO(a.paymentDate).getTime()
    );
  }, [data, selectedYear, selectedMonth, selectedPayPeriod, selectedPayrollType]);

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = [
      "Payment ID", "Borrower Name", "Payment Date",
      "Amount Due", "Amount Paid", "Shortfall", "Loan ID"
    ];

    const rows = filtered.map((r) => [
      r.id, r.borrowerName, r.paymentDate,
      `K${r.amountDue.toFixed(2)}`,
      `K${r.amountPaid.toFixed(2)}`,
      `K${r.shortfall.toFixed(2)}`,
      r.loanId
    ]);

    const blob = new Blob([[headers, ...rows].map((r) => r.join(",")).join("\n")], {
      type: "text/csv"
    });
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "partial_payments.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Partial Payments ({filtered.length})
        </h1>
        <MissedPaymentsFilters
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedPayPeriod={selectedPayPeriod}
          selectedPayrollType={selectedPayrollType}
          uniqueYears={uniqueYears}
          uniqueMonths={uniqueMonths}
          uniquePayPeriods={uniquePayPeriods}
          uniquePayrollTypes={uniquePayrollTypes}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          onPayPeriodChange={setSelectedPayPeriod}
          onPayrollTypeChange={setSelectedPayrollType}
          onExport={exportCSV}
        />
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <PartialPaymentsTable payments={filtered} />
        )}
      </Card>
    </div>
  );
};

export default PartialPayments;
