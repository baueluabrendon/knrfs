import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ResidentialInfo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-brown-800">Residential Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Lot</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Section</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Suburb</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Street Name</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Marital Status</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Spouse Last Name</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Spouse First Name</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Spouse Employer Name</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Spouse Contact Detail</Label>
          <Input readOnly className="bg-white border-gray-200 focus:border-primary/50" />
        </div>
      </div>
    </div>
  );
};