import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const FinancialInfo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Financial Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Bank</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Bank Branch</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>BSB Code</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Account Name</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Account Number</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Account Type</Label>
          <Input readOnly />
        </div>
      </div>
    </div>
  );
};