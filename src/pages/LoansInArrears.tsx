
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
import { Loader2, Printer } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
  const [uniquePayPeriods, setUniquePayPeriods] = useState<string[]>([]);

  useEffect(() => {
    fetchLoansInArrears();
  }, []);

  useEffect(() => {
    if (loansInArrears.length > 0) {
      // Extract unique pay periods from the data
      const payPeriods = Array.from(
        new Set(loansInArrears.map((loan) => loan.payPeriod))
      ).filter(Boolean);
      setUniquePayPeriods(payPeriods);
    }
  }, [loansInArrears]);

  const fetchLoansInArrears = async () => {
    try {
      setIsLoading(true);
      const data = await recoveriesApi.getLoansInArrears();
      setLoansInArrears(data);
    } catch (error) {
      console.error("Error fetching loans in arrears:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLoans =
    selectedPayPeriod === "All"
      ? loansInArrears
      : loansInArrears.filter((loan) => loan.payPeriod === selectedPayPeriod);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Loans in Arrears</h1>

        <div className="flex items-center gap-4">
          <Select
            value={selectedPayPeriod}
            onValueChange={setSelectedPayPeriod}
          >
            <SelectTrigger className="w-[180px]">
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
            onClick={() => window.print()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" /> Print
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
