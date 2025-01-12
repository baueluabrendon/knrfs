import { Label } from "@/components/ui/label";

interface LoanSummaryTotalsProps {
  totalPrincipal: number;
  totalInterest: number;
  totalGST: number;
  totalRepayable: number;
}

export const LoanSummaryTotals = ({
  totalPrincipal,
  totalInterest,
  totalGST,
  totalRepayable,
}: LoanSummaryTotalsProps) => {
  return (
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
  );
};