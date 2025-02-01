import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const FinancialInfo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-brown-800">Financial Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Bank</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Bank Branch</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">BSB Code</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Account Name</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Account Number</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Account Type</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
      </div>
    </div>
  );
};