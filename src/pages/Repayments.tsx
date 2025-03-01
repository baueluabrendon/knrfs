import { useState } from "react";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Repayment {
  id: string;
  date: string;
  amount: number;
  loanId: string;
  borrowerName: string;
  status: "pending" | "completed" | "failed";
  payPeriod: string;
  receiptUrl?: string;
}

const sampleRepayments: Repayment[] = [
  {
    id: "1",
    date: "2024-01-15",
    amount: 1500.00,
    loanId: "LOAN-001",
    borrowerName: "John Doe",
    status: "completed",
    payPeriod: "January 2024",
    receiptUrl: "#"
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
    payPeriod: "January 2024",
    receiptUrl: "#"
  }
];

const Repayments = () => {
  const [repayments] = useState<Repayment[]>(sampleRepayments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Here you would typically handle the file upload
      toast.success("Receipt uploaded successfully");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Repayments Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Repayment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Repayment Receipt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loanId">Loan ID</Label>
                <Input id="loanId" placeholder="Enter loan ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="Enter amount" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt">Receipt Document</Label>
                <Input
                  id="receipt"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                />
              </div>
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Receipt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
      </Card>
    </div>
  );
};

export default Repayments;
