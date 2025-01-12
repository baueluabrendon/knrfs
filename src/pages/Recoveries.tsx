import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface LoanInArrears {
  id: string;
  borrowerName: string;
  loanAmount: number;
  daysOverdue: number;
  amountOverdue: number;
  lastPaymentDate: string;
}

const Recoveries = () => {
  const [selectedView, setSelectedView] = useState<string>("loans-in-arrears");

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
    {
      id: "L003",
      borrowerName: "Bob Wilson",
      loanAmount: 8000,
      daysOverdue: 60,
      amountOverdue: 3000,
      lastPaymentDate: "2023-12-15",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Recoveries Management</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                View Options <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => setSelectedView("loans-in-arrears")}>
                Loans in Arrears
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedView("missed-payments")}>
                Missed Payments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedView("partial-payments")}>
                Partial Payments
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {selectedView === "loans-in-arrears" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Loans in Arrears</h2>
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
        )}
      </div>
    </DashboardLayout>
  );
};

export default Recoveries;