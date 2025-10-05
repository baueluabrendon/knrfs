import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { payrollOfficersApi, PayrollOfficer } from "@/lib/api/payroll-officers";

interface PayrollOfficerDialogProps {
  onOfficerCreated: () => void;
  officer?: PayrollOfficer;
  children?: React.ReactNode;
}

export const PayrollOfficerDialog = ({ onOfficerCreated, officer, children }: PayrollOfficerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<string[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    organization_name: officer?.organization_name || "",
    officer_name: officer?.officer_name || "",
    title: officer?.title || "",
    email: officer?.email || "",
    phone: officer?.phone || "",
    address: officer?.address || "",
  });

  // Load organizations from borrowers
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const { recoveriesApi } = await import("@/lib/api/recoveries");
        const orgs = await recoveriesApi.getOrganizations();
        setOrganizations(orgs);
      } catch (error) {
        console.error("Error loading organizations:", error);
      }
    };
    if (open) {
      loadOrganizations();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (officer) {
        await payrollOfficersApi.updatePayrollOfficer(officer.id, {
          ...formData,
          is_active: true,
        });
        toast({
          title: "Success",
          description: "Payroll officer updated successfully",
        });
      } else {
        await payrollOfficersApi.createPayrollOfficer({
          ...formData,
          is_active: true,
        });
        toast({
          title: "Success",
          description: "Payroll officer created successfully",
        });
      }

      setOpen(false);
      onOfficerCreated();
      
      if (!officer) {
        setFormData({
          organization_name: "",
          officer_name: "",
          title: "",
          email: "",
          phone: "",
          address: "",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save payroll officer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Payroll Officer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {officer ? "Edit Payroll Officer" : "Add Payroll Officer"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization_name">Organization Name</Label>
            <Select
              value={formData.organization_name}
              onValueChange={(value) => setFormData({ ...formData, organization_name: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org} value={org}>
                    {org}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="officer_name">Officer Name</Label>
            <Input
              id="officer_name"
              value={formData.officer_name}
              onChange={(e) => setFormData({ ...formData, officer_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Payroll Manager, HR Officer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : officer ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};