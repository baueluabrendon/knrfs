import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RepaymentScheduleItem {
  paymentDate: string;
  principalAmount: number;
  interestAmount: number;
  gstAmount: number;
  totalPayment: number;
  remainingBalance: number;
}

interface RepaymentScheduleProps {
  schedule: RepaymentScheduleItem[];
  loan: {
    id: string;
    borrowerName: string;
    amount: number;
    interestRate: number;
    term: number;
  };
}

export const RepaymentSchedule = ({ schedule, loan }: RepaymentScheduleProps) => {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Repayment Schedule Details</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div>
            <span className="font-medium">Loan ID:</span> {loan.id}
          </div>
          <div>
            <span className="font-medium">Borrower:</span> {loan.borrowerName}
          </div>
          <div>
            <span className="font-medium">Principal Amount:</span> ${loan.amount.toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Interest Rate:</span> {loan.interestRate}%
          </div>
          <div>
            <span className="font-medium">Term:</span> {loan.term} months
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>GST</TableHead>
              <TableHead>Total Payment</TableHead>
              <TableHead>Remaining Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedule.map((payment, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                <TableCell>${payment.principalAmount.toLocaleString()}</TableCell>
                <TableCell>${payment.interestAmount.toLocaleString()}</TableCell>
                <TableCell>${payment.gstAmount.toLocaleString()}</TableCell>
                <TableCell>${payment.totalPayment.toLocaleString()}</TableCell>
                <TableCell>${payment.remainingBalance.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};