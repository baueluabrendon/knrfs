import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const EmploymentInfo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Employment Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Department/Company</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>File Number</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Postal Address</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Work Phone Number</Label>
          <Input type="tel" readOnly />
        </div>
        <div className="space-y-2">
          <Label>Fax</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Date Employed</Label>
          <Input type="date" readOnly />
        </div>
        <div className="space-y-2">
          <Label>Paymaster</Label>
          <Input readOnly />
        </div>
      </div>
    </div>
  );
};