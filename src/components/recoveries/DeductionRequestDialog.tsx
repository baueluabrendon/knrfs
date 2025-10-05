import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { payrollOfficersApi, PayrollOfficer } from "@/lib/api/payroll-officers";
import { recoveriesApi } from "@/lib/api/recoveries";

interface ClientInDefault {
  schedule_id: string;
  loan_id: string;
  borrower_name: string;
  file_number?: string;
  organization: string;
  arrears: number;
  outstanding_balance: number;
  fortnightly_installment: number;
  pay_period: string;
  payroll_type?: string;
  scheduled_repayment_amount: number;
  missed_payment_date: string;
}

interface DeductionRequestDialogProps {
  onRequestCreated: () => void;
  children?: React.ReactNode;
}

export const DeductionRequestDialog = ({ onRequestCreated, children }: DeductionRequestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [payrollOfficers, setPayrollOfficers] = useState<PayrollOfficer[]>([]);
  const [clientsInDefault, setClientsInDefault] = useState<ClientInDefault[]>([]);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    payroll_officer_id: "",
    organization_name: "",
    pay_period: "",
    notes: "",
  });

  const loadPayrollOfficers = useCallback(async () => {
    try {
      const officers = await payrollOfficersApi.getPayrollOfficers();
      setPayrollOfficers(officers);
    } catch (error) {
      console.error("Error loading payroll officers:", error);
    }
  }, []);

  const loadClientsInDefault = useCallback(async () => {
    setLoadingClients(true);
    try {
      const data = await recoveriesApi.getClientsForDeductionRequest(
        formData.organization_name || undefined,
        formData.pay_period || undefined
      );
      
      const clientsWithDefaults = data.map(client => ({
        schedule_id: client.schedule_id,
        loan_id: client.loan_id,
        borrower_name: client.borrower_name,
        file_number: client.file_number || undefined,
        organization: client.organization || 'Unknown',
        arrears: client.arrears,
        outstanding_balance: client.outstanding_balance,
        fortnightly_installment: client.fortnightly_installment,
        pay_period: client.pay_period,
        payroll_type: client.payroll_type,
        scheduled_repayment_amount: client.scheduled_repayment_amount,
        missed_payment_date: client.missed_payment_date,
      }));
      
      setClientsInDefault(clientsWithDefaults);
    } catch (error) {
      console.error("Error loading clients in default:", error);
      toast({
        title: "Error",
        description: "Failed to load clients in default",
        variant: "destructive",
      });
    } finally {
      setLoadingClients(false);
    }
  }, [formData.organization_name, formData.pay_period, toast]);

  useEffect(() => {
    if (open) {
      loadPayrollOfficers();
      loadClientsInDefault();
    }
  }, [open, loadPayrollOfficers, loadClientsInDefault]);

  const handleOfficerChange = (officerId: string) => {
    const officer = payrollOfficers.find(o => o.id === officerId);
    setFormData({
      ...formData,
      payroll_officer_id: officerId,
      organization_name: officer?.organization_name || "",
    });
    // Auto-select clients from the same organization
    const orgClients = clientsInDefault
      .filter(client => client.organization === officer?.organization_name)
      .map(client => client.loan_id);
    setSelectedClients(new Set(orgClients));
  };

  const handleClientToggle = (loanId: string) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(loanId)) {
      newSelected.delete(loanId);
    } else {
      newSelected.add(loanId);
    }
    setSelectedClients(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClients.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one client",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedClientData = clientsInDefault
        .filter(client => selectedClients.has(client.loan_id))
        .map(client => ({
          loan_id: client.loan_id,
          borrower_name: client.borrower_name,
          file_number: client.file_number,
          loan_amount: client.outstanding_balance,
          interest_amount: 0,
          gross_amount: client.outstanding_balance,
          default_amount: client.arrears,
          current_outstanding: client.outstanding_balance,
          fortnightly_installment: client.fortnightly_installment,
          pay_period: client.pay_period,
          scheduled_repayment_amount: client.scheduled_repayment_amount,
          missed_payment_date: client.missed_payment_date,
        }));

      await payrollOfficersApi.createDeductionRequest({
        payroll_officer_id: formData.payroll_officer_id,
        organization_name: formData.organization_name,
        pay_period: formData.pay_period,
        clients: selectedClientData,
        notes: formData.notes,
      });

      toast({
        title: "Success",
        description: "Deduction request created successfully",
      });

      setOpen(false);
      onRequestCreated();
      
      // Reset form
      setFormData({
        payroll_officer_id: "",
        organization_name: "",
        pay_period: "",
        notes: "",
      });
      setSelectedClients(new Set());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create deduction request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupedClients = clientsInDefault.reduce((groups, client) => {
    const org = client.organization || "Unknown Organization";
    if (!groups[org]) groups[org] = [];
    groups[org].push(client);
    return groups;
  }, {} as Record<string, ClientInDefault[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Mail className="h-4 w-4 mr-2" />
            Create Deduction Request
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Deduction Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payroll_officer">Payroll Officer</Label>
              <Select
                value={formData.payroll_officer_id}
                onValueChange={handleOfficerChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payroll officer" />
                </SelectTrigger>
                <SelectContent>
                  {payrollOfficers.map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.officer_name} - {officer.organization_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay_period">Pay Period</Label>
              <Select
                value={formData.pay_period}
                onValueChange={(value) => setFormData({ ...formData, pay_period: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pay period" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 26 }, (_, i) => i + 1).map(period => (
                    <SelectItem key={period} value={`Pay ${period}`}>
                      Pay {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes for the deduction request"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">Select Clients ({selectedClients.size} selected)</Label>
              <div className="text-sm text-muted-foreground">
                Total Outstanding: K{clientsInDefault
                  .filter(client => selectedClients.has(client.loan_id))
                  .reduce((sum, client) => sum + client.outstanding_balance, 0)
                  .toFixed(2)}
              </div>
            </div>

            {loadingClients ? (
              <div className="text-center py-8">Loading clients...</div>
            ) : (
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Client Name</TableHead>
                      <TableHead>File Number</TableHead>
                      <TableHead>Pay Period</TableHead>
                      <TableHead>F/N Install</TableHead>
                      <TableHead>Outstanding</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(groupedClients).map(([organization, clients]) =>
                      clients.map((client) => (
                        <TableRow key={client.loan_id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedClients.has(client.loan_id)}
                              onCheckedChange={() => handleClientToggle(client.loan_id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{organization}</TableCell>
                          <TableCell>{client.borrower_name}</TableCell>
                          <TableCell>{client.file_number || 'N/A'}</TableCell>
                          <TableCell>{client.pay_period}</TableCell>
                          <TableCell>K{client.fortnightly_installment.toFixed(2)}</TableCell>
                          <TableCell>K{client.outstanding_balance.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || selectedClients.size === 0}>
              {loading ? "Creating..." : "Create Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};