
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MissedPayment } from "@/hooks/useMissedPayments";

interface MissedPaymentsTableProps {
  payments: MissedPayment[];
}

export const MissedPaymentsTable = ({ payments }: MissedPaymentsTableProps) => {
  return (
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
        {payments.length > 0 ? (
          payments.map((r) => (
            <TableRow key={`${r.loanId}-${r.payPeriod}`}>
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
  );
};
