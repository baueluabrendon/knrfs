
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Repayment } from "@/types/repayment";

interface RepaymentsTableProps {
  repayments: Repayment[];
}

const RepaymentsTable: React.FC<RepaymentsTableProps> = ({ repayments }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Pay Period</TableHead>
            <TableHead>Loan ID</TableHead>
            <TableHead>Borrower</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Receipt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repayments
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((repayment) => (
              <TableRow key={repayment.id}>
                <TableCell>{new Date(repayment.date).toLocaleDateString()}</TableCell>
                <TableCell>{repayment.payPeriod}</TableCell>
                <TableCell>{repayment.loanId}</TableCell>
                <TableCell>{repayment.borrowerName}</TableCell>
                <TableCell className="text-right">
                  ${repayment.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold
                    ${repayment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      repayment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {repayment.status.charAt(0).toUpperCase() + repayment.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  {repayment.receiptUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={repayment.receiptUrl} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RepaymentsTable;
