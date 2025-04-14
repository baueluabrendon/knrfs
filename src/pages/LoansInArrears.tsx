import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { recoveriesApi } from "@/lib/api/recoveries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

interface LoanInArrears {
  loanId: string;
  borrowerName: string;
  loanAmount: number;
  amountOverdue: number;
  daysOverdue: number;
  lastPaymentDate: string;
  payPeriod: string;
}

const LoansInArrears = () => {
  const [loansInArrears, setLoansInArrears] = useState<LoanInArrears[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");

  const [uniquePayPeriods, setUniquePayPeriods] = useState<string[]>([]);
  const [uniqueYears, setUniqueYears] = useState<string[]>([]);
  const [uniqueMonths, setUniqueMonths] = useState<string[]>([]);

  useEffect(() => {
    fetchLoansInArrears();
  }, []);

  const fetchLoansInArrears = async () => {
    try {
      setIsLoading(true);
      const data = await recoveriesApi.getLoansInArrears();
      setLoansInArrears(data);

      const payPeriods = Array.from(new Set(data.map((loan) => loan.payPeriod))).filter(Boolean);
      const years = Array.from(
        new Set(data.map((loan) => format(parseISO(loan.lastPaymentDate), "yyyy")))
      );
      const months = Array.from(
        new Set(data.map((loan) => format(parseISO(loan.lastPaymentDate), "MMMM")))
      );

      setUniquePayPeriods(payPeriods);
      setUniqueYears(years);
      setUniqueMonths(months);
    } catch (error) {
      console.error("Error fetching loans in arrears:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLoans = loansInArrears.filter((loan) => {
    const date = parseISO(loan.lastPaymentDate);
    const loanYear = format(date, "yyyy");
    const loanMonth = format(date, "MMMM");

    return (
      (selectedPayPeriod === "All" || loan.payPeriod === selectedPayPeriod) &&
      (selectedYear === "All" || loanYear === selectedYear) &&
      (selectedMonth === "All" || loanMonth === selectedMonth)
    );
  });

  const exportToCSV = () => {
    if (!filteredLoans.length) return;

    const headers = [
      "Loan ID",
      "Borrower Name",
      "Loan Amount",
      "Days Overdue",
      "Amount Overdue",
      "Last Payment Date",
      "Pay Period",
    ];

    const rows = filteredLoans.map((loan) => [
      loan.loanId,
      loan.borrowerName,
      `K${loan.loanAmount.toFixed(2)}`,
      loan.daysOverdue,
      `K${loan.amountOverdue.toFixed(2)}`,
      loan.lastPaymentDate,
      loan.payPeriod,
    ]);

    const csvContent =
      [headers, ...rows]
        .map((e) => e.join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "loans_in_arrears.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Loans in Arrears</h1>

        <div className="flex items-center gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Years</SelectItem>
              {uniqueYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Months</SelectItem>
              {uniqueMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPayPeriod} onValueChange={setSelectedPayPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Pay Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Pay Periods</SelectItem>
              {uniquePayPeriods.map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={exportToCSV}
            variant="outline"
            className="flex items-center gap-2"
          >
            Download CSV
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Borrower Name</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Amount Overdue</TableHead>
                <TableHead>Last Payment Date</TableHead>
                <TableHead>Pay Period</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => (
                  <TableRow key={loan.loanId}>
                    <TableCell>{loan.loanId}</TableCell>
                    <TableCell>{loan.borrowerName}</TableCell>
                    <TableCell>K{loan.loanAmount.toFixed(2)}</TableCell>
                    <TableCell>{loan.daysOverdue}</TableCell>
                    <TableCell>K{loan.amountOverdue.toFixed(2)}</TableCell>
                    <TableCell>{loan.lastPaymentDate}</TableCell>
                    <TableCell>{loan.payPeriod}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No loans in arrears found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default LoansInArrears;
