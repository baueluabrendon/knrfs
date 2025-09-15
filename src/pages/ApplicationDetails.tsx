import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, User, MapPin, Briefcase, DollarSign, FileText, CheckSquare, AlertTriangle, Eye } from "lucide-react";
import { LoanApplicationType } from "@/types/loan";
import ApplicationDetailsPanel from "@/components/applications/ApplicationDetailsPanel";

const ApplicationDetails = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<LoanApplicationType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('application_id', applicationId)
        .single();

      if (error) throw error;
      setApplication(data as LoanApplicationType);
    } catch (error) {
      console.error('Error fetching application:', error);
      toast.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const getBorrowerFullName = () => {
    if (!application) return 'N/A';
    const jsonbData = application.jsonb_data || {};
    const { givenName, surname } = jsonbData.personalInfo || {};
    return givenName && surname ? `${givenName} ${surname}` : 'N/A';
  };

  const getEmail = () => {
    if (!application) return 'N/A';
    const jsonbData = application.jsonb_data || {};
    return jsonbData.personalInfo?.email || 'N/A';
  };

  const getMobile = () => {
    if (!application) return 'N/A';
    const jsonbData = application.jsonb_data || {};
    return jsonbData.personalInfo?.mobilePhone || 'N/A';
  };

  const getCompany = () => {
    if (!application) return 'N/A';
    const jsonbData = application.jsonb_data || {};
    return jsonbData.employmentInfo?.employerName || 'N/A';
  };

  const getLoanAmount = () => {
    if (!application) return 0;
    const jsonbData = application.jsonb_data || {};
    return jsonbData.loanDetails?.loanAmount || 0;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async () => {
    if (!application) return;

    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('application_id', application.application_id);

      if (error) throw error;
      
      toast.success('Application approved successfully');
      setApplication({ ...application, status: 'approved' });
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    }
  };

  const handleDecline = async () => {
    if (!application) return;

    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'declined' })
        .eq('application_id', application.application_id);

      if (error) throw error;
      
      toast.success('Application declined');
      setApplication({ ...application, status: 'declined' });
    } catch (error) {
      console.error('Error declining application:', error);
      toast.error('Failed to decline application');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/applications')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
        <Card className="p-6">
          <p className="text-center text-gray-500">Application not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/admin/applications')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
        <div className="flex gap-2">
          {application.status === 'pending' && (
            <>
              <Button variant="outline" onClick={handleDecline}>
                Decline
              </Button>
              <Button onClick={handleApprove}>
                Approve
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Borrower Profile Card */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-gray-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{getBorrowerFullName()}</h1>
              <Badge className={getStatusBadgeClass(application.status)}>
                {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Email:</strong> {getEmail()}
              </div>
              <div>
                <strong>Mobile:</strong> {getMobile()}
              </div>
              <div>
                <strong>Company:</strong> {getCompany()}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" size="sm">
                Send SMS
              </Button>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Loan Amount</div>
            <div className="text-2xl font-bold">K{getLoanAmount().toLocaleString()}</div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="p-6">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">
              <Eye className="h-4 w-4 mr-2" />
              Application Details
            </TabsTrigger>
            <TabsTrigger value="checklist">
              <CheckSquare className="h-4 w-4 mr-2" />
              Document Checklist
            </TabsTrigger>
            <TabsTrigger value="credit-risk">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Credit Risk Assessment
            </TabsTrigger>
            <TabsTrigger value="submitted-forms">
              <FileText className="h-4 w-4 mr-2" />
              Submitted Forms
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <ApplicationDetailsPanel application={application} />
          </TabsContent>

          <TabsContent value="checklist" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Document Checklist</h3>
              <div className="grid gap-3">
                {[
                  'Valid ID (Driver\'s License/Passport)',
                  'Proof of Employment',
                  'Salary Certificate',
                  'Bank Statements (3 months)',
                  'Payslip (Latest)',
                  'Utility Bill (Proof of Address)'
                ].map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded">
                    <CheckSquare className="h-5 w-5 text-green-500" />
                    <span>{doc}</span>
                    <Badge variant="outline" className="ml-auto">Submitted</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="credit-risk" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Credit Risk Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Financial Health</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Debt-to-Income Ratio:</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Net Income:</span>
                      <span className="font-medium">K2,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Existing Loans:</span>
                      <span className="font-medium">1</span>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Risk Score</h4>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">75</div>
                    <div className="text-sm text-gray-500">Low Risk</div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="submitted-forms" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Submitted Forms</h3>
              <div className="grid gap-3">
                {[
                  { name: 'Loan Application Form', date: '2024-01-15', status: 'Complete' },
                  { name: 'KYC Form', date: '2024-01-15', status: 'Complete' },
                  { name: 'Employment Verification', date: '2024-01-16', status: 'Pending' },
                ].map((form, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">{form.name}</div>
                        <div className="text-sm text-gray-500">Submitted: {form.date}</div>
                      </div>
                    </div>
                    <Badge variant={form.status === 'Complete' ? 'default' : 'secondary'}>
                      {form.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ApplicationDetails;