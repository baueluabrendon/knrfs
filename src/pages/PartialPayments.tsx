
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

interface PartialPayment {
  id: string;
  borrowerName: string;
  paymentDate: string;
  amountDue: number;
  amountPaid: number;
  shortfall: number;
  loanId: string;
}

const PartialPayments = () => {
  const [partialPayments, setPartialPayments] = useState<PartialPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPartialPayments();
  }, []);

  const fetchPartialPayments = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, we would use the API
      // const data = await recoveriesApi.getPartialPayments();
      // setPartialPayments(data);
      
      // For now, use sample data
      setPartialPayments([
        {
          id: "PP001",
          borrowerName: "John Doe",
          paymentDate: "2024-01-15",
          amountDue: 1000,
          amountPaid: 700,
          shortfall: 300,
          loanId: "L001",
        },
        {
          id: "PP002",
          borrowerName: "Jane Smith",
          paymentDate: "2024-01-01",
          amountDue: 1500,
          amountPaid: 1000,
          shortfall: 500,
          loanId: "L002",
        },
      ]);
    } catch (error) {
      console.error("Error fetching partial payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Partial Payments</h1>
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
                <TableHead>Payment Date</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Shortfall</TableHead>
                <TableHead>Loan ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partialPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>{payment.borrowerName}</TableCell>
                  <TableCell>{payment.paymentDate}</TableCell>
                  <TableCell>K{payment.amountDue.toFixed(2)}</TableCell>
                  <TableCell>K{payment.amountPaid.toFixed(2)}</TableCell>
                  <TableCell>K{payment.shortfall.toFixed(2)}</TableCell>
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

export default PartialPayments;
