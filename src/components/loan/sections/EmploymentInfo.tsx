import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const EmploymentInfo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-brown-800">Employment Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Department/Company</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">File Number</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Postal Address</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Work Phone Number</Label>
          <Input type="tel" readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Fax</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Date Employed</Label>
          <Input type="date" readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Paymaster</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
      </div>
    </div>
  );
};