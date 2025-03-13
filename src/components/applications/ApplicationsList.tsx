
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
import { Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { LoanApplicationType } from "@/types/loan";
import { formatAmount, getStatusBadgeClass } from "./utils";
import { format } from "date-fns";

interface ApplicationsListProps {
  onViewApplication: (application: LoanApplicationType) => void;
}

const ApplicationsList = ({ onViewApplication }: ApplicationsListProps) => {
  const [applications, setApplications] = useState<LoanApplicationType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('public:applications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'applications' 
      }, () => {
        fetchApplications();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
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

  const getBorrowerFullName = (application: LoanApplicationType) => {
    const jsonbData = application.jsonb_data || {};
    const { givenName, surname } = jsonbData.personalInfo || {};
    return givenName && surname ? `${givenName} ${surname}` : 'N/A';
  };

  const getPhoneNumber = (application: LoanApplicationType) => {
    const jsonbData = application.jsonb_data || {};
    return jsonbData.personalInfo?.mobilePhone || 'N/A';
  };

  const getEmail = (application: LoanApplicationType) => {
    const jsonbData = application.jsonb_data || {};
    return jsonbData.personalInfo?.email || 'N/A';
  };

  const getCompany = (application: LoanApplicationType) => {
    const jsonbData = application.jsonb_data || {};
    return jsonbData.employmentInfo?.employerName || 'N/A';
  };

  const getPosition = (application: LoanApplicationType) => {
    const jsonbData = application.jsonb_data || {};
    return jsonbData.employmentInfo?.position || 'N/A';
  };

  const getPrincipal = (application: LoanApplicationType) => {
    const jsonbData = application.jsonb_data || {};
    return jsonbData.loanDetails?.loanAmount || 0;
  };

  const getInterest = (application: LoanApplicationType) => {
    const principal = getPrincipal(application);
    const grossLoan = getGrossLoan(application);
    return grossLoan - principal;
  };

  const getGrossLoan = (application: LoanApplicationType) => {
    const jsonbData = application.jsonb_data || {};
    return jsonbData.loanDetails?.grossLoan || 0;
  };

  const getSubmissionDate = (application: LoanApplicationType) => {
    return application.uploaded_at ? format(new Date(application.uploaded_at), 'dd/MM/yyyy') : 'N/A';
  };

  const getReviewStatus = (application: LoanApplicationType) => {
    // This could be enhanced later to show more detailed review status
    return application.status === 'pending' ? 'Pending Review' : 
           application.status === 'approved' ? 'Approved' : 
           application.status === 'declined' ? 'Declined' : 'N/A';
  };

  const getReviewedBy = (application: LoanApplicationType) => {
    // This would need to be populated from a reviewers field in the application data
    // For now returning N/A as placeholder
    return 'N/A';
  };

  const getDocumentChecklist = (application: LoanApplicationType) => {
    // This would need logic to check what documents have been submitted
    // For now returning a placeholder
    return 'Pending';
  };

  const getCreditRiskAnalysis = (application: LoanApplicationType) => {
    // This would need logic to determine credit risk
    // For now returning a placeholder
    return 'Pending';
  };

  return (
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
                <TableHead>Application ID</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department/Company</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Gross Loan</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Review Status</TableHead>
                <TableHead>Reviewed By</TableHead>
                <TableHead>Document Checklist</TableHead>
                <TableHead>Credit Risk Analysis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.application_id}>
                  <TableCell>{application.application_id}</TableCell>
                  <TableCell>{getBorrowerFullName(application)}</TableCell>
                  <TableCell>{getPhoneNumber(application)}</TableCell>
                  <TableCell>{getEmail(application)}</TableCell>
                  <TableCell>{getCompany(application)}</TableCell>
                  <TableCell>{getPosition(application)}</TableCell>
                  <TableCell>${formatAmount(getPrincipal(application))}</TableCell>
                  <TableCell>${formatAmount(getInterest(application))}</TableCell>
                  <TableCell>${formatAmount(getGrossLoan(application))}</TableCell>
                  <TableCell>{getSubmissionDate(application)}</TableCell>
                  <TableCell>{getReviewStatus(application)}</TableCell>
                  <TableCell>{getReviewedBy(application)}</TableCell>
                  <TableCell>{getDocumentChecklist(application)}</TableCell>
                  <TableCell>{getCreditRiskAnalysis(application)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}>
                      {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewApplication(application)} 
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
  );
};

export default ApplicationsList;
