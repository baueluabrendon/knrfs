
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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleViewApplication = (application: LoanApplicationType) => {
    setSelectedApplication(application);
    setShowApplicationDetails(true);
  };

  const handleApproveApplication = async () => {
    if (!selectedApplication) return;

    try {
      setIsProcessing(true);
      
      // First update the application status in the database
      const { error } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('application_id', selectedApplication.application_id);

      if (error) throw error;
      
      // Get the latest application data before sending to the edge function
      const { data: updatedApplication, error: fetchError } = await supabase
        .from('applications')
        .select('*')
        .eq('application_id', selectedApplication.application_id)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      if (!updatedApplication) {
        throw new Error('Could not find the updated application');
      }
      
      // Log the application data to verify application_document_url is present
      console.log('Application data to be sent to edge function:', updatedApplication);
      
      if (!updatedApplication.application_document_url) {
        console.error('Missing application_document_url for application:', selectedApplication.application_id);
        toast.error('Application document URL is missing. OCR processing cannot proceed.');
        throw new Error('Application document URL is missing');
      }
      
      // Call the edge function to process the approved application with Google Vision API
      const edgeFunctionUrl = 'https://mhndkefbyvxasvayigvx.supabase.co/functions/v1/process-approved-application';
      
      console.log('Calling edge function to process application:', updatedApplication.application_id);
      console.log('With document URL:', updatedApplication.application_document_url);
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          record: {
            application_id: updatedApplication.application_id,
            application_document_url: updatedApplication.application_document_url,
            status: updatedApplication.status,
            jsonb_data: updatedApplication.jsonb_data
          } 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process application');
      }
      
      const result = await response.json();
      console.log('Edge function response:', result);
      
      toast.success('Application approved and processed successfully');
      setShowApplicationDetails(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application: ' + (error.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
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
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default Applications;
