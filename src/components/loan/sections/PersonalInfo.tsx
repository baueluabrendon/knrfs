import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const PersonalInfo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-brown-800">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Given Name</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Surname</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
          <Input type="date" readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Gender</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Mobile Number</Label>
          <Input type="tel" readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Email</Label>
          <Input type="email" readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Village</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">District</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Province</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Nationality</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
      </div>
    </div>
  );
};