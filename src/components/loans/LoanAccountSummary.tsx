import { Label } from "@/components/ui/label";

interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "defaulted";
  term: number;
}

export const LoanAccountSummary = ({ loan }: { loan: Loan }) => {
  return (
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
  );
};