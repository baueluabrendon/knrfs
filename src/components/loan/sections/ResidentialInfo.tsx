import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ResidentialInfo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Residential Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Lot</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Section</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Suburb</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Street Name</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Marital Status</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Spouse Last Name</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Spouse First Name</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Spouse Employer Name</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Spouse Contact Detail</Label>
          <Input readOnly />
        </div>
      </div>
    </div>
  );
};