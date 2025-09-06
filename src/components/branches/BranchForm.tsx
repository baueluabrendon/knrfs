import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateBranchData, UpdateBranchData } from "@/lib/api/branches";

interface BranchFormProps {
  initialData?: Partial<CreateBranchData>;
  onSubmit: (data: CreateBranchData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

const BranchForm: React.FC<BranchFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false
}) => {
  const [formData, setFormData] = React.useState<CreateBranchData>({
    branch_code: initialData?.branch_code || "",
    branch_name: initialData?.branch_name || "",
    branch_type: initialData?.branch_type || "branch_office",
    address_line1: initialData?.address_line1 || "",
    address_line2: initialData?.address_line2 || "",
    city: initialData?.city || "",
    state_province: initialData?.state_province || "",
    postal_code: initialData?.postal_code || "",
    country: initialData?.country || "Papua New Guinea",
    phone_number: initialData?.phone_number || "",
    email: initialData?.email || "",
    manager_name: initialData?.manager_name || "",
    manager_contact: initialData?.manager_contact || "",
    opening_date: initialData?.opening_date || "",
  });

  const handleInputChange = (field: keyof CreateBranchData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="branch_code" className="text-sm font-medium">
            Branch Code *
          </Label>
          <Input
            id="branch_code"
            value={formData.branch_code}
            onChange={(e) => handleInputChange("branch_code", e.target.value)}
            placeholder="e.g., HO001, BR001"
            required
            disabled={isEditing}
          />
        </div>
        <div>
          <Label htmlFor="branch_type" className="text-sm font-medium">
            Branch Type *
          </Label>
          <Select 
            value={formData.branch_type} 
            onValueChange={(value) => handleInputChange("branch_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select branch type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="head_office">Head Office</SelectItem>
              <SelectItem value="branch_office">Branch Office</SelectItem>
              <SelectItem value="service_center">Service Center</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="branch_name" className="text-sm font-medium">
          Branch Name *
        </Label>
        <Input
          id="branch_name"
          value={formData.branch_name}
          onChange={(e) => handleInputChange("branch_name", e.target.value)}
          placeholder="Enter branch name"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="address_line1" className="text-sm font-medium">
            Address Line 1
          </Label>
          <Input
            id="address_line1"
            value={formData.address_line1}
            onChange={(e) => handleInputChange("address_line1", e.target.value)}
            placeholder="Street address"
          />
        </div>
        <div>
          <Label htmlFor="address_line2" className="text-sm font-medium">
            Address Line 2
          </Label>
          <Input
            id="address_line2"
            value={formData.address_line2}
            onChange={(e) => handleInputChange("address_line2", e.target.value)}
            placeholder="Apartment, suite, etc."
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city" className="text-sm font-medium">
            City
          </Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            placeholder="City"
          />
        </div>
        <div>
          <Label htmlFor="state_province" className="text-sm font-medium">
            State/Province
          </Label>
          <Input
            id="state_province"
            value={formData.state_province}
            onChange={(e) => handleInputChange("state_province", e.target.value)}
            placeholder="State or Province"
          />
        </div>
        <div>
          <Label htmlFor="postal_code" className="text-sm font-medium">
            Postal Code
          </Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => handleInputChange("postal_code", e.target.value)}
            placeholder="Postal code"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="country" className="text-sm font-medium">
          Country
        </Label>
        <Input
          id="country"
          value={formData.country}
          onChange={(e) => handleInputChange("country", e.target.value)}
          placeholder="Country"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone_number" className="text-sm font-medium">
            Phone Number
          </Label>
          <Input
            id="phone_number"
            value={formData.phone_number}
            onChange={(e) => handleInputChange("phone_number", e.target.value)}
            placeholder="+675 XXX XXXX"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="branch@company.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="manager_name" className="text-sm font-medium">
            Manager Name
          </Label>
          <Input
            id="manager_name"
            value={formData.manager_name}
            onChange={(e) => handleInputChange("manager_name", e.target.value)}
            placeholder="Branch manager name"
          />
        </div>
        <div>
          <Label htmlFor="manager_contact" className="text-sm font-medium">
            Manager Contact
          </Label>
          <Input
            id="manager_contact"
            value={formData.manager_contact}
            onChange={(e) => handleInputChange("manager_contact", e.target.value)}
            placeholder="Manager's phone number"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="opening_date" className="text-sm font-medium">
          Opening Date
        </Label>
        <Input
          id="opening_date"
          type="date"
          value={formData.opening_date}
          onChange={(e) => handleInputChange("opening_date", e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : isEditing ? "Update Branch" : "Create Branch"}
        </Button>
      </div>
    </form>
  );
};

export default BranchForm;