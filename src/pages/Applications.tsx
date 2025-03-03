import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Eye, CheckCircle, XCircle } from "lucide-react";
import { LoanApplicationType } from "@/types/loan";

const Applications = () => {
  const [applications, setApplications] = useState<LoanApplicationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplicationType | null>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setApplications(data as unknown as LoanApplicationType[] || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application: LoanApplicationType) => {
    setSelectedApplication(application);
    setShowApplicationDetails(true);
  };

  const handleApproveApplication = async () => {
    if (!selectedApplication) return;

    try {
      setProcessingAction(true);
      const { error } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('application_id', selectedApplication.application_id);

      if (error) throw error;
      
      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mhndkefbyvxasvayigvx.supabase.co'}/functions/v1/process-approved-application`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obmRrZWZieXZ4YXN2YXlpZ3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMDExODUsImV4cCI6MjA1Mjc3NzE4NX0.4J7F6LmEtTFPSrAae6sjIt2g96HeS8KKfiV7eH20vjM'}`
        },
        body: JSON.stringify({ record: selectedApplication })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process application');
      }
      
      toast.success('Application approved and processed successfully');
      setShowApplicationDetails(false);
      fetchApplications();
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeclineApplication = async () => {
    if (!selectedApplication) return;

    try {
      setProcessingAction(true);
      const { error } = await supabase
        .from('applications')
        .update({ status: 'declined' })
        .eq('application_id', selectedApplication.application_id);

      if (error) throw error;
      
      toast.success('Application declined');
      setShowApplicationDetails(false);
      fetchApplications();
    } catch (error) {
      console.error('Error declining application:', error);
      toast.error('Failed to decline application');
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (data: any) => {
    if (!data?.jsonb_data?.financialDetails?.loanAmount) return 'N/A';
    return `$${parseFloat(data.jsonb_data.financialDetails.loanAmount).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Loan Applications</h1>
        <Button onClick={fetchApplications}>Refresh</Button>
      </div>
      
      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : applications.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No applications found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Amount Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.application_id}>
                    <TableCell>{application.application_id}</TableCell>
                    <TableCell>{formatAmount(application)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(application.uploaded_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewApplication(application)} 
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {selectedApplication && (
        <Dialog open={showApplicationDetails} onOpenChange={setShowApplicationDetails}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <p><span className="font-medium">Name:</span> {selectedApplication.jsonb_data?.personalDetails?.firstName} {selectedApplication.jsonb_data?.personalDetails?.middleName} {selectedApplication.jsonb_data?.personalDetails?.lastName}</p>
                    <p><span className="font-medium">Date of Birth:</span> {selectedApplication.jsonb_data?.personalDetails?.dateOfBirth}</p>
                    <p><span className="font-medium">Gender:</span> {selectedApplication.jsonb_data?.personalDetails?.gender}</p>
                    <p><span className="font-medium">Email:</span> {selectedApplication.jsonb_data?.personalDetails?.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedApplication.jsonb_data?.personalDetails?.phone}</p>
                    <p><span className="font-medium">ID:</span> {selectedApplication.jsonb_data?.personalDetails?.idType} - {selectedApplication.jsonb_data?.personalDetails?.idNumber}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Employment Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <p><span className="font-medium">Employer:</span> {selectedApplication.jsonb_data?.employmentDetails?.employerName}</p>
                    <p><span className="font-medium">Occupation:</span> {selectedApplication.jsonb_data?.employmentDetails?.occupation}</p>
                    <p><span className="font-medium">Employed Since:</span> {selectedApplication.jsonb_data?.employmentDetails?.employmentDate}</p>
                    <p><span className="font-medium">Salary:</span> {selectedApplication.jsonb_data?.employmentDetails?.salary}</p>
                    <p><span className="font-medium">Pay Day:</span> {selectedApplication.jsonb_data?.employmentDetails?.payDay}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Residential Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <p><span className="font-medium">Address:</span> {selectedApplication.jsonb_data?.residentialDetails?.address}</p>
                    <p><span className="font-medium">Suburb:</span> {selectedApplication.jsonb_data?.residentialDetails?.suburb}</p>
                    <p><span className="font-medium">City:</span> {selectedApplication.jsonb_data?.residentialDetails?.city}</p>
                    <p><span className="font-medium">Province:</span> {selectedApplication.jsonb_data?.residentialDetails?.province}</p>
                    <p><span className="font-medium">Postal Code:</span> {selectedApplication.jsonb_data?.residentialDetails?.postalCode}</p>
                    <p><span className="font-medium">Years at Address:</span> {selectedApplication.jsonb_data?.residentialDetails?.yearsAtAddress}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Loan Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <p><span className="font-medium">Amount:</span> ${selectedApplication.jsonb_data?.financialDetails?.loanAmount}</p>
                    <p><span className="font-medium">Purpose:</span> {selectedApplication.jsonb_data?.financialDetails?.loanPurpose}</p>
                    <p><span className="font-medium">Term:</span> {selectedApplication.jsonb_data?.financialDetails?.loanTerm}</p>
                    <p><span className="font-medium">Bi-weekly Payment:</span> ${selectedApplication.jsonb_data?.financialDetails?.fortnightlyInstallment}</p>
                    <p><span className="font-medium">Gross Loan:</span> ${selectedApplication.jsonb_data?.financialDetails?.grossLoan}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              {selectedApplication.status === 'pending' && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleDeclineApplication}
                    disabled={processingAction}
                    className="flex items-center gap-1"
                  >
                    {processingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Decline
                  </Button>
                  <Button 
                    onClick={handleApproveApplication}
                    disabled={processingAction}
                    className="flex items-center gap-1"
                  >
                    {processingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Approve
                  </Button>
                </>
              )}
              {selectedApplication.status !== 'pending' && (
                <span className={`px-3 py-1 rounded-full font-medium ${getStatusBadgeClass(selectedApplication.status)}`}>
                  {selectedApplication.status.toUpperCase()}
                </span>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Applications;
