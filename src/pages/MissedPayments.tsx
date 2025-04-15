
import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { parseISO, isValid, format } from "date-fns";
import { useMissedPayments } from "@/hooks/useMissedPayments";
import { MissedPaymentsFilters } from "@/components/missed-payments/MissedPaymentsFilters";
import { MissedPaymentsTable } from "@/components/missed-payments/MissedPaymentsTable";

const MissedPayments = () => {
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedPayPeriod, setSelectedPayPeriod] = useState("All");
  const [selectedPayrollType, setSelectedPayrollType] = useState("All");

  const { data: queryData, isLoading } = useMissedPayments();
  const { data = [], uniqueYears = [], uniqueMonths = [], uniquePayPeriods = [], uniquePayrollTypes = [] } = queryData || {};

  useEffect(() => {
    if (selectedYear !== "All" && selectedPayPeriod !== "All") {
      const matched = data.find((r) => {
        const date = parseISO(r.dueDate);
        return (
          r.payPeriod === selectedPayPeriod &&
          isValid(date) &&
          format(date, "yyyy") === selectedYear
        );
      });
      if (matched) {
        const month = format(parseISO(matched.dueDate), "MMMM");
        setSelectedMonth(month);
      } else {
        setSelectedMonth("None");
      }
    }
  }, [selectedYear, selectedPayPeriod, data]);

  const filtered = useMemo(() => {
    const filteredSet = new Map();

    for (const r of data) {
      const date = parseISO(r.dueDate);
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
      (a, b) => parseISO(b.dueDate).getTime() - parseISO(a.dueDate).getTime()
    );
  }, [data, selectedYear, selectedMonth, selectedPayPeriod, selectedPayrollType]);

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = [
      "Loan ID", "Borrower Name", "File Number", "Organization",
      "Pay Period", "Payroll Type", "Due Date", "Amount Due",
      "Default Amount", "Outstanding Balance"
    ];

    const rows = filtered.map((r) => [
      r.loanId, r.borrowerName, r.fileNumber, r.organization,
      r.payPeriod, r.payrollType, r.dueDate,
      `K${r.amountDue.toFixed(2)}`,
      `K${r.defaultAmount.toFixed(2)}`,
      `K${r.outstandingBalance.toFixed(2)}`
    ]);

    const blob = new Blob([[headers, ...rows].map((r) => r.join(",")).join("\n")], {
      type: "text/csv"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "missed_payments.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Missed Payments ({filtered.length})
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
          <MissedPaymentsTable payments={filtered} />
        )}
      </Card>
    </div>
  );
};

export default MissedPayments;
