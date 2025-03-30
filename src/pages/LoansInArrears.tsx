
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
import { Loader2 } from "lucide-react";

interface LoanInArrears {
  id: string;
  borrowerName: string;
  loanAmount: number;
  daysOverdue: number;
  amountOverdue: number;
  lastPaymentDate: string;
}

const LoansInArrears = () => {
  const [loansInArrears, setLoansInArrears] = useState<LoanInArrears[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLoansInArrears();
  }, []);

  const fetchLoansInArrears = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, we would use the API
      // const data = await recoveriesApi.getLoansInArrears();
      // setLoansInArrears(data);
      
      // For now, use sample data
      setLoansInArrears([
        {
          id: "L001",
          borrowerName: "John Doe",
          loanAmount: 10000,
          daysOverdue: 30,
          amountOverdue: 1200,
          lastPaymentDate: "2024-01-15",
        },
        {
          id: "L002",
          borrowerName: "Jane Smith",
          loanAmount: 15000,
          daysOverdue: 45,
          amountOverdue: 2000,
          lastPaymentDate: "2024-01-01",
        },
      ]);
    } catch (error) {
      console.error("Error fetching loans in arrears:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Loans in Arrears</h1>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {loansInArrears.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.id}</TableCell>
                  <TableCell>{loan.borrowerName}</TableCell>
                  <TableCell>K{loan.loanAmount.toFixed(2)}</TableCell>
                  <TableCell>{loan.daysOverdue}</TableCell>
                  <TableCell>K{loan.amountOverdue.toFixed(2)}</TableCell>
                  <TableCell>{loan.lastPaymentDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default LoansInArrears;
