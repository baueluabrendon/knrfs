
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

interface MissedPayment {
  id: string;
  borrowerName: string;
  paymentDueDate: string;
  amountDue: number;
  daysLate: number;
  loanId: string;
}

const MissedPayments = () => {
  const [missedPayments, setMissedPayments] = useState<MissedPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMissedPayments();
  }, []);

  const fetchMissedPayments = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, we would use the API
      // const data = await recoveriesApi.getMissedPayments();
      // setMissedPayments(data);
      
      // For now, use sample data
      setMissedPayments([
        {
          id: "MP001",
          borrowerName: "John Doe",
          paymentDueDate: "2024-01-15",
          amountDue: 500,
          daysLate: 10,
          loanId: "L001",
        },
        {
          id: "MP002",
          borrowerName: "Jane Smith",
          paymentDueDate: "2024-01-01",
          amountDue: 750,
          daysLate: 24,
          loanId: "L002",
        },
      ]);
    } catch (error) {
      console.error("Error fetching missed payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Missed Payments</h1>
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
                <TableHead>Payment ID</TableHead>
                <TableHead>Borrower Name</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Days Late</TableHead>
                <TableHead>Loan ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {missedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>{payment.borrowerName}</TableCell>
                  <TableCell>{payment.paymentDueDate}</TableCell>
                  <TableCell>K{payment.amountDue.toFixed(2)}</TableCell>
                  <TableCell>{payment.daysLate}</TableCell>
                  <TableCell>{payment.loanId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default MissedPayments;
