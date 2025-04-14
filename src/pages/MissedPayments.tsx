
import { useEffect, useState } from "react";
import { recoveriesApi } from "@/lib/api/recoveries";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { parseISO, isValid, format } from "date-fns";

interface MissedPayment {
  loanId: string;
  borrowerName: string;
  fileNumber: string;
  organization: string;
  payPeriod: string;
  payrollType: string;
  dueDate: string;
  amountDue: number;
  defaultAmount: number;
  outstandingBalance: number;
}

const MissedPayments = () => {
  const [data, setData] = useState<MissedPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedPayPeriod, setSelectedPayPeriod] = useState("All");
  const [selectedPayrollType, setSelectedPayrollType] = useState("All");

  const [uniqueYears, setUniqueYears] = useState<string[]>([]);
  const [uniqueMonths, setUniqueMonths] = useState<string[]>([]);
  const [uniquePayPeriods, setUniquePayPeriods] = useState<string[]>([]);
  const [uniquePayrollTypes, setUniquePayrollTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchMissedPayments();
  }, []);

  const fetchMissedPayments = async () => {
    try {
      setIsLoading(true);
      const result = await recoveriesApi.getMissedPayments();
      setData(result);

      const validDates = result.filter(r => isValid(parseISO(r.dueDate)));
      setUniqueYears([...new Set(validDates.map(r => format(parseISO(r.dueDate), "yyyy")))]);
      setUniqueMonths([...new Set(validDates.map(r => format(parseISO(r.dueDate), "MMMM")))]);
      setUniquePayPeriods([...new Set(result.map(r => r.payPeriod).filter(Boolean))]);
      setUniquePayrollTypes([...new Set(result.map(r => r.payrollType).filter(Boolean))]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = data.filter((r) => {
    const date = parseISO(r.dueDate);
    if (!isValid(date)) return false;

    const year = format(date, "yyyy");
    const month = format(date, "MMMM");

    return (
      (selectedYear === "All" || year === selectedYear) &&
      (selectedMonth === "All" || month === selectedMonth) &&
      (selectedPayPeriod === "All" || r.payPeriod === selectedPayPeriod) &&
      (selectedPayrollType === "All" || r.payrollType === selectedPayrollType)
    );
  });

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = [
      "Loan ID",
      "Borrower Name",
      "File Number",
      "Organization",
      "Pay Period",
      "Payroll Type",
      "Due Date",
      "Amount Due",
      "Default Amount",
      "Outstanding Balance",
    ];

    const rows = filtered.map((r) => [
      r.loanId,
      r.borrowerName,
      r.fileNumber,
      r.organization,
      r.payPeriod,
      r.payrollType,
      r.dueDate,
      `K${r.amountDue.toFixed(2)}`,
      `K${r.defaultAmount.toFixed(2)}`,
      `K${r.outstandingBalance.toFixed(2)}`,
    ]);

    const blob = new Blob([[headers, ...rows].map((r) => r.join(",")).join("\n")], {
      type: "text/csv",
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
        <h1 className="text-2xl font-bold">Missed Payments ({filtered.length})</h1>
        <div className="flex gap-4 flex-wrap">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {uniqueYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {uniqueMonths.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedPayPeriod} onValueChange={setSelectedPayPeriod}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Pay Period" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {uniquePayPeriods.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedPayrollType} onValueChange={setSelectedPayrollType}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Payroll Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {uniquePayrollTypes.map((pt) => <SelectItem key={pt} value={pt}>{pt}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={exportCSV} variant="outline">Download CSV</Button>
        </div>
      </div>
      <Card className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>File #</TableHead>
                <TableHead>Org</TableHead>
                <TableHead>Pay Period</TableHead>
                <TableHead>Payroll</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Outstanding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((r) => (
                  <TableRow key={r.loanId}>
                    <TableCell>{r.loanId}</TableCell>
                    <TableCell>{r.borrowerName}</TableCell>
                    <TableCell>{r.fileNumber}</TableCell>
                    <TableCell>{r.organization}</TableCell>
                    <TableCell>{r.payPeriod}</TableCell>
                    <TableCell>{r.payrollType}</TableCell>
                    <TableCell>{r.dueDate}</TableCell>
                    <TableCell>K{r.amountDue.toFixed(2)}</TableCell>
                    <TableCell>K{r.defaultAmount.toFixed(2)}</TableCell>
                    <TableCell>K{r.outstandingBalance.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6">
                    No missed payments match your filters.
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

export default MissedPayments;
