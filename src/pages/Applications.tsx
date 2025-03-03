
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LoanApplicationType } from "@/types/loan";
import ApplicationsList from "@/components/applications/ApplicationsList";
import ApplicationDetailsDialog from "@/components/applications/ApplicationDetailsDialog";

const Applications = () => {
  const [selectedApplication, setSelectedApplication] = useState<LoanApplicationType | null>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);

  const handleViewApplication = (application: LoanApplicationType) => {
    setSelectedApplication(application);
    setShowApplicationDetails(true);
  };

  const handleApproveApplication = async () => {
    if (!selectedApplication) return;

    try {
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
      // Refresh the applications list by forcing a re-render
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeclineApplication = async () => {
    if (!selectedApplication) return;

    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'declined' })
        .eq('application_id', selectedApplication.application_id);

      if (error) throw error;
      
      toast.success('Application declined');
      setShowApplicationDetails(false);
      // Refresh the applications list by forcing a re-render
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error declining application:', error);
      toast.error('Failed to decline application');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Loan Applications</h1>
        <Button onClick={() => setSelectedApplication(null)}>Refresh</Button>
      </div>
      
      <ApplicationsList onViewApplication={handleViewApplication} />

      <ApplicationDetailsDialog
        selectedApplication={selectedApplication}
        open={showApplicationDetails}
        onOpenChange={setShowApplicationDetails}
        onApprove={handleApproveApplication}
        onDecline={handleDeclineApplication}
      />
    </div>
  );
};

export default Applications;
