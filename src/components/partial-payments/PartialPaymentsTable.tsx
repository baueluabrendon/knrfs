
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PartialPayment } from "@/hooks/usePartialPayments";

interface PartialPaymentsTableProps {
  payments: PartialPayment[];
}

export const PartialPaymentsTable = ({ payments }: PartialPaymentsTableProps) => {
  return (
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
        {payments.length > 0 ? (
          payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.id}</TableCell>
              <TableCell>{payment.borrowerName}</TableCell>
              <TableCell>{payment.paymentDate}</TableCell>
              <TableCell>K{payment.amountDue.toFixed(2)}</TableCell>
              <TableCell>K{payment.amountPaid.toFixed(2)}</TableCell>
              <TableCell>K{payment.shortfall.toFixed(2)}</TableCell>
              <TableCell>{payment.loanId}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-6">
              No partial payments match your filters.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
