import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const PersonalInfo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Given Name</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Surname</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Input type="date" readOnly />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Mobile Number</Label>
          <Input type="tel" readOnly />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" readOnly />
        </div>
        <div className="space-y-2">
          <Label>Village</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>District</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Province</Label>
          <Input readOnly />
        </div>
        <div className="space-y-2">
          <Label>Nationality</Label>
          <Input readOnly />
        </div>
      </div>
    </div>
  );
};