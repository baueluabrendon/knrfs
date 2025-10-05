import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  pva_amount: number; // PVA AMOUNT
  principal_amount: number;
  interest_amount: number;
  gross_loan_amount: number;
  default_amount: number;
  pay_period: string;
  payroll_type?: string;
  scheduled_repayment_amount: number;
  missed_payment_date: string;
  status: 'default' | 'partial';
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
  const [totalActiveClients, setTotalActiveClients] = useState(0);
  const [dataSource, setDataSource] = useState<'all' | 'missed' | 'partial'>('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    payroll_officer_id: "",
    organization_name: "",
    organization_address: "",
    pay_period: "",
    current_pay_period: "",
    next_pay_period: "",
    next_pay_date: "",
    cc_emails: "",
    include_isda_forms: true,
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
        formData.current_pay_period || formData.pay_period || undefined
      );
      
      let filteredData = data;
      
      // Apply data source filter
      if (dataSource === 'missed') {
        filteredData = data.filter(client => client.status === 'default');
      } else if (dataSource === 'partial') {
        filteredData = data.filter(client => client.status === 'partial');
      }
      
      const clientsWithDefaults = filteredData.map(client => ({
        schedule_id: client.schedule_id,
        loan_id: client.loan_id,
        borrower_name: client.borrower_name,
        file_number: client.file_number || undefined,
        organization: client.organization || 'Unknown',
        arrears: client.arrears,
        outstanding_balance: client.outstanding_balance,
        fortnightly_installment: client.fortnightly_installment,
        pva_amount: client.pva_amount,
        principal_amount: client.principal_amount,
        interest_amount: client.interest_amount,
        gross_loan_amount: client.gross_loan_amount,
        default_amount: client.default_amount,
        pay_period: client.pay_period,
        payroll_type: client.payroll_type,
        scheduled_repayment_amount: client.scheduled_repayment_amount,
        missed_payment_date: client.missed_payment_date,
        status: (client.status === 'default' || client.status === 'partial') ? client.status : 'default',
      } as ClientInDefault));
      
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
  }, [formData.organization_name, formData.pay_period, formData.current_pay_period, dataSource, toast]);

  // Load total active clients for the organization
  useEffect(() => {
    const loadOrgDetails = async () => {
      if (formData.organization_name) {
        try {
          const count = await recoveriesApi.getTotalActiveClientsForOrg(formData.organization_name);
          setTotalActiveClients(count);
          
          const orgDetails = await recoveriesApi.getOrganizationDetails(formData.organization_name);
          if (orgDetails) {
            const address = [
              orgDetails.address_line1,
              orgDetails.address_line2,
              orgDetails.city,
              orgDetails.postal_code
            ].filter(Boolean).join('\n');
            
            setFormData(prev => ({ ...prev, organization_address: address }));
          }
        } catch (error) {
          console.error('Error loading organization details:', error);
        }
      }
    };
    
    loadOrgDetails();
  }, [formData.organization_name]);

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

  const handlePayPeriodChange = (period: string) => {
    // Calculate next pay period
    const { nextPeriod, nextDate } = recoveriesApi.calculateNextPayPeriod(period);
    
    setFormData(prev => ({
      ...prev,
      current_pay_period: period,
      pay_period: period,
      next_pay_period: nextPeriod,
      next_pay_date: nextDate.toISOString().split('T')[0]
    }));
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
          principal_amount: client.principal_amount,
          interest_amount: client.interest_amount,
          gross_loan_amount: client.gross_loan_amount,
          loan_amount: client.gross_loan_amount,
          gross_amount: client.outstanding_balance,
          default_amount: client.default_amount,
          current_outstanding: client.outstanding_balance,
          fortnightly_installment: client.fortnightly_installment,
          pva_amount: client.pva_amount,
          pay_period: client.pay_period,
          scheduled_repayment_amount: client.scheduled_repayment_amount,
          missed_payment_date: client.missed_payment_date,
        }));

      await payrollOfficersApi.createDeductionRequest({
        payroll_officer_id: formData.payroll_officer_id,
        organization_name: formData.organization_name,
        pay_period: formData.pay_period,
        current_pay_period: formData.current_pay_period,
        next_pay_period: formData.next_pay_period,
        next_pay_date: formData.next_pay_date,
        organization_address: formData.organization_address,
        total_active_clients: totalActiveClients,
        cc_emails: formData.cc_emails ? formData.cc_emails.split(',').map(e => e.trim()).filter(Boolean) : [],
        include_isda_forms: formData.include_isda_forms,
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
        organization_address: "",
        pay_period: "",
        current_pay_period: "",
        next_pay_period: "",
        next_pay_date: "",
        cc_emails: "",
        include_isda_forms: true,
        notes: "",
      });
      setSelectedClients(new Set());
      setTotalActiveClients(0);
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
              <Label htmlFor="current_pay_period">Current Pay Period (Defaulted)</Label>
              <Select
                value={formData.current_pay_period}
                onValueChange={handlePayPeriodChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select current pay period" />
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

          {formData.next_pay_period && (
            <div className="bg-muted p-3 rounded-md text-sm">
              <strong>Requesting deductions for:</strong> {formData.next_pay_period} (on or around {formData.next_pay_date})
            </div>
          )}

          {formData.organization_name && (
            <div className="text-sm text-muted-foreground">
              Total Active Clients with {formData.organization_name}: <strong>{totalActiveClients}</strong>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization_address">Organization Address</Label>
              <Textarea
                id="organization_address"
                value={formData.organization_address}
                onChange={(e) => setFormData({ ...formData, organization_address: e.target.value })}
                placeholder="Full mailing address of the organization"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cc_emails">CC Email Addresses</Label>
              <Input
                id="cc_emails"
                value={formData.cc_emails}
                onChange={(e) => setFormData({ ...formData, cc_emails: e.target.value })}
                placeholder="manager@example.com, hr@example.com"
              />
              <div className="text-xs text-muted-foreground">Separate multiple emails with commas</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_source">Data Source</Label>
            <Select
              value={dataSource}
              onValueChange={(value: 'all' | 'missed' | 'partial') => setDataSource(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Defaults (Missed + Partial)</SelectItem>
                <SelectItem value="missed">Missed Payments Only</SelectItem>
                <SelectItem value="partial">Partial Payments Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
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
                      <TableHead>Client Name</TableHead>
                      <TableHead>File #</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Interest</TableHead>
                      <TableHead>Gross Loan</TableHead>
                      <TableHead>PVA Amount</TableHead>
                      <TableHead>Default Fee</TableHead>
                      <TableHead>Current Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(groupedClients).map(([organization, clients]) => (
                      <>
                        <TableRow key={`header-${organization}`} className="bg-muted/50">
                          <TableCell colSpan={9} className="font-semibold">
                            {organization}
                          </TableCell>
                        </TableRow>
                        {clients.map((client) => (
                          <TableRow key={client.loan_id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedClients.has(client.loan_id)}
                                onCheckedChange={() => handleClientToggle(client.loan_id)}
                              />
                            </TableCell>
                            <TableCell>{client.borrower_name}</TableCell>
                            <TableCell>{client.file_number || 'N/A'}</TableCell>
                            <TableCell>K{client.principal_amount.toFixed(2)}</TableCell>
                            <TableCell>K{client.interest_amount.toFixed(2)}</TableCell>
                            <TableCell>K{client.gross_loan_amount.toFixed(2)}</TableCell>
                            <TableCell>K{client.pva_amount.toFixed(2)}</TableCell>
                            <TableCell>K{client.default_amount.toFixed(2)}</TableCell>
                            <TableCell>K{client.outstanding_balance.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </>
                    ))}
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