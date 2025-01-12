import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface Repayment {
  id: string;
  date: string;
  amount: number;
  loanId: string;
  borrowerName: string;
  status: "pending" | "completed" | "failed";
  payPeriod: string;
}

const sampleRepayments: Repayment[] = [
  {
    id: "1",
    date: "2024-01-15",
    amount: 1500.00,
    loanId: "LOAN-001",
    borrowerName: "John Doe",
    status: "completed",
    payPeriod: "January 2024"
  },
  {
    id: "2",
    date: "2024-01-14",
    amount: 2500.00,
    loanId: "LOAN-002",
    borrowerName: "Jane Smith",
    status: "pending",
    payPeriod: "January 2024"
  },
  {
    id: "3",
    date: "2024-01-13",
    amount: 1000.00,
    loanId: "LOAN-003",
    borrowerName: "Bob Wilson",
    status: "completed",
    payPeriod: "January 2024"
  }
];

const Repayments = () => {
  const [repayments] = useState<Repayment[]>(sampleRepayments);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Repayments Management</h1>
        <Card className="p-6">
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
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Repayments;