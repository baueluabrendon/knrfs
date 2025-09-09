import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, Mail, Eye, Users, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { payrollOfficersApi, PayrollOfficer, DeductionRequest } from "@/lib/api/payroll-officers";
import { PayrollOfficerDialog } from "./PayrollOfficerDialog";
import { DeductionRequestDialog } from "./DeductionRequestDialog";
import { DeductionRequestDetails } from "./DeductionRequestDetails";

export const PayrollManagementTab = () => {
  const [payrollOfficers, setPayrollOfficers] = useState<PayrollOfficer[]>([]);
  const [deductionRequests, setDeductionRequests] = useState<DeductionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [officers, requests] = await Promise.all([
        payrollOfficersApi.getPayrollOfficers(),
        payrollOfficersApi.getDeductionRequests(),
      ]);
      setPayrollOfficers(officers);
      setDeductionRequests(requests);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load payroll management data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOfficer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payroll officer?")) return;

    try {
      await payrollOfficersApi.deletePayrollOfficer(id);
      toast({
        title: "Success",
        description: "Payroll officer deleted successfully",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payroll officer",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async (requestId: string) => {
    setSendingEmail(requestId);
    try {
      await payrollOfficersApi.sendDeductionRequestEmail(requestId);
      await payrollOfficersApi.updateDeductionRequestStatus(requestId, 'sent');
      
      toast({
        title: "Success",
        description: "Deduction request email sent successfully",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send deduction request email",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(null);
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

  if (loading) {
    return <div className="text-center py-8">Loading payroll management data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payroll Management</h2>
          <p className="text-muted-foreground">
            Manage payroll officers and deduction requests for loan recoveries
          </p>
        </div>
        <div className="flex gap-2">
          <PayrollOfficerDialog onOfficerCreated={loadData} />
          <DeductionRequestDialog onRequestCreated={loadData} />
        </div>
      </div>

      <Tabs defaultValue="officers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="officers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Payroll Officers ({payrollOfficers.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Deduction Requests ({deductionRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="officers">
          <Card className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Officer Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollOfficers.map((officer) => (
                  <TableRow key={officer.id}>
                    <TableCell className="font-medium">{officer.organization_name}</TableCell>
                    <TableCell>{officer.officer_name}</TableCell>
                    <TableCell>{officer.title || 'N/A'}</TableCell>
                    <TableCell>{officer.email}</TableCell>
                    <TableCell>{officer.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <PayrollOfficerDialog
                          officer={officer}
                          onOfficerCreated={loadData}
                        >
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PayrollOfficerDialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteOfficer(officer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {payrollOfficers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No payroll officers found. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead>Clients</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deductionRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{new Date(request.request_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{request.organization_name}</TableCell>
                    <TableCell>{request.payroll_officer?.officer_name || 'N/A'}</TableCell>
                    <TableCell>{request.total_clients}</TableCell>
                    <TableCell>K{request.total_amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <DeductionRequestDetails requestId={request.id}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DeductionRequestDetails>
                        {request.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendEmail(request.id)}
                            disabled={sendingEmail === request.id}
                          >
                            <Mail className="h-4 w-4" />
                            {sendingEmail === request.id ? 'Sending...' : 'Send Email'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {deductionRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No deduction requests found. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};