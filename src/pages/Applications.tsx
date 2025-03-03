
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
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data as LoanApplicationType[] || []);
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
        .from('loan_applications')
        .update({ status: 'approved' })
        .eq('id', selectedApplication.id);

      if (error) throw error;
      
      toast.success('Application approved successfully');
      setShowApplicationDetails(false);
      fetchApplications();
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeclineApplication = async () => {
    if (!selectedApplication) return;

    try {
      setProcessingAction(true);
      const { error } = await supabase
        .from('loan_applications')
        .update({ status: 'declined' })
        .eq('id', selectedApplication.id);

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
                  <TableRow key={application.id}>
                    <TableCell>{application.id}</TableCell>
                    <TableCell>${application.amount_requested?.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
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
                    <p><span className="font-medium">Name:</span> {selectedApplication.application_data.personalDetails?.firstName} {selectedApplication.application_data.personalDetails?.middleName} {selectedApplication.application_data.personalDetails?.lastName}</p>
                    <p><span className="font-medium">Date of Birth:</span> {selectedApplication.application_data.personalDetails?.dateOfBirth}</p>
                    <p><span className="font-medium">Gender:</span> {selectedApplication.application_data.personalDetails?.gender}</p>
                    <p><span className="font-medium">Email:</span> {selectedApplication.application_data.personalDetails?.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedApplication.application_data.personalDetails?.phone}</p>
                    <p><span className="font-medium">ID:</span> {selectedApplication.application_data.personalDetails?.idType} - {selectedApplication.application_data.personalDetails?.idNumber}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Employment Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <p><span className="font-medium">Employer:</span> {selectedApplication.application_data.employmentDetails?.employerName}</p>
                    <p><span className="font-medium">Occupation:</span> {selectedApplication.application_data.employmentDetails?.occupation}</p>
                    <p><span className="font-medium">Employed Since:</span> {selectedApplication.application_data.employmentDetails?.employmentDate}</p>
                    <p><span className="font-medium">Salary:</span> {selectedApplication.application_data.employmentDetails?.salary}</p>
                    <p><span className="font-medium">Pay Day:</span> {selectedApplication.application_data.employmentDetails?.payDay}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Residential Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <p><span className="font-medium">Address:</span> {selectedApplication.application_data.residentialDetails?.address}</p>
                    <p><span className="font-medium">Suburb:</span> {selectedApplication.application_data.residentialDetails?.suburb}</p>
                    <p><span className="font-medium">City:</span> {selectedApplication.application_data.residentialDetails?.city}</p>
                    <p><span className="font-medium">Province:</span> {selectedApplication.application_data.residentialDetails?.province}</p>
                    <p><span className="font-medium">Postal Code:</span> {selectedApplication.application_data.residentialDetails?.postalCode}</p>
                    <p><span className="font-medium">Years at Address:</span> {selectedApplication.application_data.residentialDetails?.yearsAtAddress}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Loan Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <p><span className="font-medium">Amount:</span> ${selectedApplication.application_data.financialDetails?.loanAmount}</p>
                    <p><span className="font-medium">Purpose:</span> {selectedApplication.application_data.financialDetails?.loanPurpose}</p>
                    <p><span className="font-medium">Term:</span> {selectedApplication.application_data.financialDetails?.loanTerm}</p>
                    <p><span className="font-medium">Interest:</span> ${selectedApplication.application_data.financialDetails?.interest}</p>
                    <p><span className="font-medium">Bi-weekly Payment:</span> ${selectedApplication.application_data.financialDetails?.fortnightlyInstallment}</p>
                    <p><span className="font-medium">Gross Loan:</span> ${selectedApplication.application_data.financialDetails?.grossLoan}</p>
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
