import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface BorrowerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  monthlyIncome: number;
}

interface BorrowerFormProps {
  onSubmit: (data: BorrowerFormData) => void;
  onCancel?: () => void;
}

const BorrowerForm = ({ onSubmit, onCancel }: BorrowerFormProps) => {
  const [formData, setFormData] = useState<BorrowerFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    occupation: "",
    monthlyIncome: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "monthlyIncome" ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="monthlyIncome">Monthly Income</Label>
          <Input
            id="monthlyIncome"
            name="monthlyIncome"
            type="number"
            value={formData.monthlyIncome}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};

export default BorrowerForm;