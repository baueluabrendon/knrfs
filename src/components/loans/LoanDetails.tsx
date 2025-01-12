import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Printer, X } from "lucide-react";

interface RepaymentScheduleItem {
  paymentDate: string;
  principalAmount: number;
  interestAmount: number;
  gstAmount: number;
  totalPayment: number;
  remainingBalance: number;
}

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

interface LoanDetailsProps {
  loan: Loan;
  onClose: () => void;
  onPrint: () => void;
  onEmail: () => void;
}

const LoanDetails = ({
  loan,
  onClose,
  onPrint,
  onEmail,
}: LoanDetailsProps) => {
  const calculateRepaymentSchedule = (loan: Loan): RepaymentScheduleItem[] => {
    const schedule: RepaymentScheduleItem[] = [];
    const numberOfPayments = loan.term * 2; // Fortnightly payments
    const principalPerPayment = loan.amount / numberOfPayments;
    let remainingBalance = loan.amount;
    const startDate = new Date(loan.startDate);
    
    for (let i = 0; i < numberOfPayments; i++) {
      const paymentDate = new Date(startDate);
      paymentDate.setDate(paymentDate.getDate() + (i * 14)); // Add 14 days for each payment
      
      const interestAmount = (remainingBalance * (loan.interestRate / 100)) / 26; // Annual rate divided by 26 fortnights
      const gstAmount = interestAmount * 0.1; // 10% GST on interest
      const totalPayment = principalPerPayment + interestAmount + gstAmount;
      
      remainingBalance -= principalPerPayment;
      
      schedule.push({
        paymentDate: paymentDate.toISOString().split('T')[0],
        principalAmount: Number(principalPerPayment.toFixed(2)),
        interestAmount: Number(interestAmount.toFixed(2)),
        gstAmount: Number(gstAmount.toFixed(2)),
        totalPayment: Number(totalPayment.toFixed(2)),
        remainingBalance: Number(remainingBalance.toFixed(2))
      });
    }
    
    return schedule;
  };

  const repaymentSchedule = calculateRepaymentSchedule(loan);
  
  // Calculate totals
  const totalPrincipal = loan.amount;
  const totalInterest = repaymentSchedule.reduce((sum, payment) => sum + payment.interestAmount, 0);
  const totalGST = repaymentSchedule.reduce((sum, payment) => sum + payment.gstAmount, 0);
  const totalRepayable = totalPrincipal + totalInterest + totalGST;

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

      <div className="space-y-6">
        {/* Loan Account Summary */}
        <div className="rounded-lg border p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Loan Account Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Loan ID</Label>
              <div className="mt-1">{loan.id}</div>
            </div>
            <div>
              <Label>Amount</Label>
              <div className="mt-1">${loan.amount.toLocaleString()}</div>
            </div>
            <div>
              <Label>Interest Rate</Label>
              <div className="mt-1">{loan.interestRate}%</div>
            </div>
            <div>
              <Label>Term</Label>
              <div className="mt-1">{loan.term} months</div>
            </div>
            <div>
              <Label>Start Date</Label>
              <div className="mt-1">{new Date(loan.startDate).toLocaleDateString()}</div>
            </div>
            <div>
              <Label>End Date</Label>
              <div className="mt-1">{new Date(loan.endDate).toLocaleDateString()}</div>
            </div>
            <div>
              <Label>Status</Label>
              <div className="mt-1">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                  loan.status === 'active' ? 'bg-green-100 text-green-800' :
                  loan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Borrower Information Summary */}
        <div className="rounded-lg border p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Borrower Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Borrower ID</Label>
              <div className="mt-1">{loan.borrowerId}</div>
            </div>
            <div>
              <Label>Name</Label>
              <div className="mt-1">{loan.borrowerName}</div>
            </div>
            <div>
              <Label>Email</Label>
              <div className="mt-1">{loan.borrowerEmail}</div>
            </div>
            <div>
              <Label>Phone</Label>
              <div className="mt-1">{loan.borrowerPhone}</div>
            </div>
          </div>
        </div>

        {/* Loan Summary Totals */}
        <div className="rounded-lg border p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Loan Summary Totals</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Principal Amount</Label>
              <div className="mt-1">${totalPrincipal.toLocaleString()}</div>
            </div>
            <div>
              <Label>Total Interest</Label>
              <div className="mt-1">${totalInterest.toFixed(2)}</div>
            </div>
            <div>
              <Label>Total GST</Label>
              <div className="mt-1">${totalGST.toFixed(2)}</div>
            </div>
            <div>
              <Label>Total Amount Repayable</Label>
              <div className="mt-1 font-semibold text-lg">${totalRepayable.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Repayment Schedule */}
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Repayment Schedule</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>GST</TableHead>
                  <TableHead>Total Payment</TableHead>
                  <TableHead>Remaining Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repaymentSchedule.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>${payment.principalAmount.toLocaleString()}</TableCell>
                    <TableCell>${payment.interestAmount.toLocaleString()}</TableCell>
                    <TableCell>${payment.gstAmount.toLocaleString()}</TableCell>
                    <TableCell>${payment.totalPayment.toLocaleString()}</TableCell>
                    <TableCell>${payment.remainingBalance.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;