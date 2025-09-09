import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { payrollOfficersApi, DeductionRequest, DeductionRequestClient } from "@/lib/api/payroll-officers";

interface DeductionRequestDetailsProps {
  requestId: string;
  children?: React.ReactNode;
}

export const DeductionRequestDetails = ({ requestId, children }: DeductionRequestDetailsProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<DeductionRequest | null>(null);
  const [clients, setClients] = useState<DeductionRequestClient[]>([]);

  useEffect(() => {
    if (open) {
      loadRequestDetails();
    }
  }, [open, requestId]);

  const loadRequestDetails = async () => {
    setLoading(true);
    try {
      const [requests, clientsData] = await Promise.all([
        payrollOfficersApi.getDeductionRequests(),
        payrollOfficersApi.getDeductionRequestClients(requestId),
      ]);
      
      const currentRequest = requests.find(r => r.id === requestId);
      setRequest(currentRequest || null);
      setClients(clientsData);
    } catch (error) {
      console.error("Error loading request details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: DeductionRequest['status']) => {
    const variants = {
      pending: 'default' as const,
      sent: 'secondary' as const,
      acknowledged: 'outline' as const,
      completed: 'default' as const,
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deduction Request Details</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-8">Loading request details...</div>
        ) : request ? (
          <div className="space-y-6">
            {/* Request Summary */}
            <Card className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Organization</label>
                  <p className="font-semibold">{request.organization_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Officer</label>
                  <p className="font-semibold">{request.payroll_officer?.officer_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Request Date</label>
                  <p className="font-semibold">{new Date(request.request_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(request.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pay Period</label>
                  <p className="font-semibold">{request.pay_period || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Clients</label>
                  <p className="font-semibold">{request.total_clients}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                  <p className="font-semibold">K{request.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Sent</label>
                  <p className="font-semibold">
                    {request.email_sent_at 
                      ? new Date(request.email_sent_at).toLocaleDateString()
                      : 'Not sent'
                    }
                  </p>
                </div>
              </div>
              
              {request.notes && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{request.notes}</p>
                </div>
              )}

              {request.payroll_officer && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">Officer Contact</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p><strong>Email:</strong> {request.payroll_officer.email}</p>
                    {request.payroll_officer.phone && (
                      <p><strong>Phone:</strong> {request.payroll_officer.phone}</p>
                    )}
                    {request.payroll_officer.title && (
                      <p><strong>Title:</strong> {request.payroll_officer.title}</p>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Client Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Client Details</h3>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Name</TableHead>
                      <TableHead>File Number</TableHead>
                      <TableHead>Loan ID</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Default Amount</TableHead>
                      <TableHead>Outstanding</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.borrower_name}</TableCell>
                        <TableCell>{client.file_number || 'N/A'}</TableCell>
                        <TableCell>{client.loan_id}</TableCell>
                        <TableCell>K{(client.loan_amount || 0).toFixed(2)}</TableCell>
                        <TableCell>K{(client.default_amount || 0).toFixed(2)}</TableCell>
                        <TableCell>K{(client.current_outstanding || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {clients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No clients found for this request
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">Request not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
};