import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const LoanDetails = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Loan Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Purpose of Loan</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Loan Amount</Label>
          <Input type="number" readOnly />
        </div>
        <div className="space-y-2">
          <Label>PVA Amount</Label>
          <Input type="number" readOnly />
        </div>
        <div className="space-y-2">
          <Label>Loan Term</Label>
          <Input type="number" readOnly />
        </div>
        <div className="space-y-2">
          <Label>Total Repayable</Label>
          <Input type="number" readOnly />
        </div>
        <div className="space-y-2">
          <Label>Gross Salary</Label>
          <Input type="number" readOnly />
        </div>
        <div className="space-y-2">
          <Label>Net Salary</Label>
          <Input type="number" readOnly />
        </div>
      </div>
    </div>
  );
};