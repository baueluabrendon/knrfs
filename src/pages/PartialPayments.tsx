import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  // Sample data - replace with actual data source
  const partialPayments: PartialPayment[] = [
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
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Partial Payments</h1>
        </div>
        <Card className="p-6">
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
                  <TableCell>${payment.amountDue.toLocaleString()}</TableCell>
                  <TableCell>${payment.amountPaid.toLocaleString()}</TableCell>
                  <TableCell>${payment.shortfall.toLocaleString()}</TableCell>
                  <TableCell>{payment.loanId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PartialPayments;