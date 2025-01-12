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

interface MissedPayment {
  id: string;
  borrowerName: string;
  paymentDueDate: string;
  amountDue: number;
  daysLate: number;
  loanId: string;
}

const MissedPayments = () => {
  // Sample data - replace with actual data source
  const missedPayments: MissedPayment[] = [
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
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Missed Payments</h1>
        </div>
        <Card className="p-6">
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
                  <TableCell>${payment.amountDue.toLocaleString()}</TableCell>
                  <TableCell>{payment.daysLate}</TableCell>
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

export default MissedPayments;