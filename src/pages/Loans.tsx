
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LoanDetails from "@/components/loans/LoanDetails";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";

interface Loan {
  id: string;
  borrowerName: string;
  amount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "defaulted";
  borrowerId: string;
  borrowerEmail: string;
  borrowerPhone: string;
  term: number;
}

const Loans = () => {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loans] = useState<Loan[]>([
    {
      id: "L001",
      borrowerName: "John Doe",
      amount: 5000,
      interestRate: 5.5,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      status: "active",
      borrowerId: "B001",
      borrowerEmail: "john@example.com",
      borrowerPhone: "1234567890",
      term: 12,
    },
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    toast({
      title: "Email Sent",
      description: "Loan details have been emailed successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Loans Management</h1>
        <Button onClick={() => navigate("/admin/loans/add")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Loan
        </Button>
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
              <TableRow 
                key={loan.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedLoan(loan)}
              >
                <TableCell className="font-medium text-blue-600 hover:underline">
                  {loan.id}
                </TableCell>
                <TableCell>{loan.borrowerName}</TableCell>
                <TableCell>${loan.amount.toLocaleString()}</TableCell>
                <TableCell>{loan.interestRate}%</TableCell>
                <TableCell>{new Date(loan.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(loan.endDate).toLocaleDateString()}</TableCell>
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

      <Dialog open={!!selectedLoan} onOpenChange={(open) => !open && setSelectedLoan(null)}>
        <DialogContent className="max-w-4xl">
          {selectedLoan && (
            <LoanDetails
              loan={selectedLoan}
              onClose={() => setSelectedLoan(null)}
              onPrint={handlePrint}
              onEmail={handleEmail}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Loans;
