import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Printer, X } from "lucide-react";

interface Loan {
  id: string;
  amount: number;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'repaid';
}

interface Borrower {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  monthlyIncome: number;
  activeLoanId: string | null;
}

interface BorrowerDetailsProps {
  borrower: Borrower;
  loanHistory: Loan[];
  onClose: () => void;
  onPrint: () => void;
  onEmail: () => void;
}

const BorrowerDetails = ({
  borrower,
  loanHistory,
  onClose,
  onPrint,
  onEmail,
}: BorrowerDetailsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" onClick={onPrint}>
          <Printer className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onEmail}>
          <Mail className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>ID</Label>
          <div className="mt-1">{borrower.id}</div>
        </div>
        <div>
          <Label>Name</Label>
          <div className="mt-1">{borrower.name}</div>
        </div>
        <div>
          <Label>Email</Label>
          <div className="mt-1">{borrower.email}</div>
        </div>
        <div>
          <Label>Phone</Label>
          <div className="mt-1">{borrower.phone}</div>
        </div>
        <div>
          <Label>Address</Label>
          <div className="mt-1">{borrower.address}</div>
        </div>
        <div>
          <Label>Occupation</Label>
          <div className="mt-1">{borrower.occupation}</div>
        </div>
        <div>
          <Label>Monthly Income</Label>
          <div className="mt-1">${borrower.monthlyIncome.toLocaleString()}</div>
        </div>
        <div>
          <Label>Active Loan ID</Label>
          <div className="mt-1">{borrower.activeLoanId || 'No active loan'}</div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Loan History</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loanHistory.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell>{loan.id}</TableCell>
                <TableCell>${loan.amount.toLocaleString()}</TableCell>
                <TableCell>{new Date(loan.startDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {loan.endDate ? new Date(loan.endDate).toLocaleDateString() : 'Active'}
                </TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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
  );
};

export default BorrowerDetails;