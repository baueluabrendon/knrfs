
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface LoanInArrears {
  id: string;
  borrowerName: string;
  loanAmount: number;
  daysOverdue: number;
  amountOverdue: number;
  lastPaymentDate: string;
}

const LoansInArrears = () => {
  // Sample data - replace with actual data source
  const loansInArrears: LoanInArrears[] = [
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Loans in Arrears</h1>
      </div>
      <Card className="p-6">
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
                <TableCell>${loan.loanAmount.toLocaleString()}</TableCell>
                <TableCell>{loan.daysOverdue}</TableCell>
                <TableCell>${loan.amountOverdue.toLocaleString()}</TableCell>
                <TableCell>{loan.lastPaymentDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default LoansInArrears;
