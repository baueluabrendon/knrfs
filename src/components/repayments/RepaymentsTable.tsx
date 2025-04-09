
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Repayment } from "@/types/repayment";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, FileEdit } from "lucide-react";

interface RepaymentsTableProps {
  repayments: Repayment[];
}

const RepaymentsTable: React.FC<RepaymentsTableProps> = ({ repayments }) => {
  // Function to get badge style based on status
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Loan ID</TableHead>
            <TableHead>Borrower</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Receipt</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repayments
            .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
            .map((repayment) => (
              <TableRow key={repayment.repayment_id}>
                <TableCell>{new Date(repayment.payment_date).toLocaleDateString()}</TableCell>
                <TableCell>{repayment.loan_id}</TableCell>
                <TableCell>{repayment.borrowerName}</TableCell>
                <TableCell className="text-right">
                  ${repayment.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeStyle(repayment.status)}`}>
                    {repayment.status.charAt(0).toUpperCase() + repayment.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  {repayment.receipt_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={repayment.receipt_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </a>
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  {repayment.notes ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center text-gray-600">
                            <FileEdit className="h-4 w-4 mr-1" />
                            <span className="truncate max-w-[100px]">{repayment.notes}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{repayment.notes}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-gray-400">-</span>
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
