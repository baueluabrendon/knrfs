
import { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { recoveriesApi } from "@/lib/api/recoveries";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format, parseISO, isValid } from "date-fns";
import { Loader2 } from "lucide-react";

interface LoanInArrears {
  loanId: string;
  fileNumber: string;
  borrowerName: string;
  email: string;
  mobileNumber: string;
  organization: string;
  loanAmount: number;
  daysOverdue: number;
  amountOverdue: number;
  lastPaymentDate: string;
  payPeriod: string;
}

const LoansInArrears = () => {
  const [loansInArrears, setLoansInArrears] = useState<LoanInArrears[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedPayPeriod, setSelectedPayPeriod] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedBucket, setSelectedBucket] = useState("All");

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

      setUniquePayPeriods([...new Set(data.map(l => l.payPeriod))].filter(Boolean));

      const years = Array.from(new Set(
        data.map((loan) => {
          const date = parseISO(loan.lastPaymentDate);
          return isValid(date) ? format(date, "yyyy") : null;
        }).filter(Boolean)
      ));

      const months = Array.from(new Set(
        data.map((loan) => {
          const date = parseISO(loan.lastPaymentDate);
          return isValid(date) ? format(date, "MMMM") : null;
        }).filter(Boolean)
      ));

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
    if (!isValid(date)) return false;

    const year = format(date, "yyyy");
    const month = format(date, "MMMM");

    const matchYear = selectedYear === "All" || year === selectedYear;
    const matchMonth = selectedMonth === "All" || month === selectedMonth;
    const matchPay = selectedPayPeriod === "All" || loan.payPeriod === selectedPayPeriod;

    let matchBucket = true;
    if (selectedBucket !== "All") {
      if (selectedBucket === "0–30 days") matchBucket = loan.daysOverdue <= 30;
      else if (selectedBucket === "30–60 days") matchBucket = loan.daysOverdue > 30 && loan.daysOverdue <= 60;
      else if (selectedBucket === "60–90 days") matchBucket = loan.daysOverdue > 60 && loan.daysOverdue <= 90;
      else if (selectedBucket === "90+ days") matchBucket = loan.daysOverdue > 90;
    }

    if (selectedPayPeriod !== "All") {
      return matchYear && matchPay && matchBucket;
    }
    return matchYear && matchMonth && matchBucket;
  });

  const uniqueLoans = filteredLoans.reduce((acc, loan) => {
    if (!acc.find((l) => l.loanId === loan.loanId)) acc.push(loan);
    return acc;
  }, [] as LoanInArrears[]);

  const exportToCSV = () => {
    if (!uniqueLoans.length) return;

    const headers = [
      "Loan ID", "File Number", "Borrower Name", "Email", "Mobile Number", "Organization",
      "Loan Amount", "Days Overdue", "Amount Overdue", "Last Payment Date", "Pay Period"
    ];

    const rows = uniqueLoans.map((loan) => [
      loan.loanId,
      loan.fileNumber,
      loan.borrowerName,
      loan.email,
      loan.mobileNumber,
      loan.organization,
      `K${loan.loanAmount.toFixed(2)}`,
      loan.daysOverdue,
      `K${loan.amountOverdue.toFixed(2)}`,
      loan.lastPaymentDate,
      loan.payPeriod,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "loans_in_arrears.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Loans in Arrears ({uniqueLoans.length} found)
        </h1>
        <div className="flex flex-wrap gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Years</SelectItem>
              {uniqueYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
            disabled={selectedPayPeriod !== "All"}
          >
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Months</SelectItem>
              {uniqueMonths.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedPayPeriod} onValueChange={setSelectedPayPeriod}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Pay Period" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Pay Periods</SelectItem>
              {uniquePayPeriods.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedBucket} onValueChange={setSelectedBucket}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Overdue Bucket" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Buckets</SelectItem>
              <SelectItem value="0–30 days">0–30 days</SelectItem>
              <SelectItem value="30–60 days">30–60 days</SelectItem>
              <SelectItem value="60–90 days">60–90 days</SelectItem>
              <SelectItem value="90+ days">90+ days</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportToCSV} variant="outline">
            Download CSV
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>File No.</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Arrears</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead>Pay Period</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uniqueLoans.map((loan) => (
                <TableRow key={loan.loanId}>
                  <TableCell>{loan.loanId}</TableCell>
                  <TableCell>{loan.fileNumber}</TableCell>
                  <TableCell>{loan.borrowerName}</TableCell>
                  <TableCell>{loan.email}</TableCell>
                  <TableCell>{loan.mobileNumber}</TableCell>
                  <TableCell>{loan.organization}</TableCell>
                  <TableCell>K{loan.loanAmount.toFixed(2)}</TableCell>
                  <TableCell>{loan.daysOverdue}</TableCell>
                  <TableCell>K{loan.amountOverdue.toFixed(2)}</TableCell>
                  <TableCell>{loan.lastPaymentDate}</TableCell>
                  <TableCell>{loan.payPeriod}</TableCell>
                </TableRow>
              ))}
              {!uniqueLoans.length && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-6">
                    No loans in arrears match your filters.
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
