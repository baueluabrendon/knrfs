import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const LoanDetails = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-brown-800">Loan Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Purpose of Loan</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Loan Amount</Label>
          <Input type="number" readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">PVA Amount</Label>
          <Input type="number" readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Loan Term</Label>
          <Input type="number" readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Total Repayable</Label>
          <Input type="number" readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Gross Salary</Label>
          <Input type="number" readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Net Salary</Label>
          <Input type="number" readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
      </div>
    </div>
  );
};