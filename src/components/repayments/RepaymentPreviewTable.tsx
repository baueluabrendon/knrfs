
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BulkRepaymentData } from "@/types/repayment";
import { FileEdit } from "lucide-react";

interface RepaymentPreviewTableProps {
  repayments: BulkRepaymentData[];
}

const RepaymentPreviewTable = ({ repayments }: RepaymentPreviewTableProps) => {
  return (
    <div className="rounded-md border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Borrower Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead>Loan ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repayments.map((repayment, index) => (
            <TableRow key={index}>
              <TableCell>{repayment.borrowerName}</TableCell>
              <TableCell>${Number(repayment.amount).toFixed(2)}</TableCell>
              <TableCell>{repayment.payment_date}</TableCell>
              <TableCell>{repayment.loan_id || 'Not found'}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  repayment.loan_id 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {repayment.loan_id ? 'Valid' : 'Invalid loan'}
                </span>
              </TableCell>
              <TableCell>
                {repayment.notes ? (
                  <div className="flex items-center">
                    <FileEdit className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="truncate max-w-[150px]">{repayment.notes}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">No notes</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RepaymentPreviewTable;
