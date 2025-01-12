import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Loan {
  id: string;
  borrowerName: string;
  amount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "defaulted";
}

const Loans = () => {
  // Mock data - replace with actual data fetching
  const [loans] = useState<Loan[]>([
    {
      id: "L001",
      borrowerName: "John Doe",
      amount: 5000,
      interestRate: 5.5,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      status: "active",
    },
    // Add more mock data as needed
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Loans Management</h1>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.id}</TableCell>
                  <TableCell>{loan.borrowerName}</TableCell>
                  <TableCell>${loan.amount.toLocaleString()}</TableCell>
                  <TableCell>{loan.interestRate}%</TableCell>
                  <TableCell>{loan.startDate}</TableCell>
                  <TableCell>{loan.endDate}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      loan.status === 'active' ? 'bg-green-100 text-green-800' :
                      loan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Loans;