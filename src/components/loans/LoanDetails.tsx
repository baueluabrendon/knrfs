import { Button } from "@/components/ui/button";
import { Mail, Printer, X } from "lucide-react";
import { LoanAccountSummary } from "./LoanAccountSummary";
import { BorrowerInformation } from "./BorrowerInformation";
import { LoanSummaryTotals } from "./LoanSummaryTotals";
import { RepaymentSchedule } from "./RepaymentSchedule";

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
        <LoanAccountSummary loan={loan} />
        <BorrowerInformation 
          borrower={{
            borrowerId: loan.borrowerId,
            borrowerName: loan.borrowerName,
            borrowerEmail: loan.borrowerEmail,
            borrowerPhone: loan.borrowerPhone,
          }} 
        />
        <LoanSummaryTotals
          totalPrincipal={totalPrincipal}
          totalInterest={totalInterest}
          totalGST={totalGST}
          totalRepayable={totalRepayable}
        />
        <RepaymentSchedule 
          schedule={repaymentSchedule} 
          loan={{
            id: loan.id,
            borrowerName: loan.borrowerName,
            amount: loan.amount,
            interestRate: loan.interestRate,
            term: loan.term,
          }}
        />
      </div>
    </div>
  );
};

export default LoanDetails;