
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BulkRepaymentData } from "@/types/repayment";

export function useBulkRepayments() {
  const [parsedData, setParsedData] = useState<BulkRepaymentData[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isParsingCSV, setIsParsingCSV] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRepayments = async () => {
    if (parsedData.length === 0) {
      toast.error("No repayment data to submit");
      return;
    }
    
    if (!documentUrl) {
      toast.error("Please upload a repayment group document");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const repaymentsToInsert = parsedData
        .filter(item => item.loan_id)
        .map(item => ({
          loan_id: item.loan_id,
          amount: item.amount,
          payment_date: item.payment_date,
          status: 'completed',
          receipt_url: documentUrl,
          notes: item.notes,
          source: 'system' as "system" | "client",
          verification_status: 'approved' as "pending" | "approved" | "rejected",
          verified_at: new Date().toISOString(),
          verified_by: user?.email
        }));
      
      if (repaymentsToInsert.length === 0) {
        toast.error("No valid repayments to submit");
        setIsSubmitting(false);
        return;
      }
      
      const { error } = await supabase
        .from('repayments')
        .insert(repaymentsToInsert);
        
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success(`Successfully processed ${repaymentsToInsert.length} repayments`);
      resetForm();
    } catch (error) {
      console.error("Error submitting repayments:", error);
      toast.error(`Failed to submit repayments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setParsedData([]);
    setCsvFile(null);
    setDocumentFile(null);
    setDocumentUrl(null);
  };

  const handleCancelUpload = () => {
    resetForm();
    toast.info("Upload process cancelled");
  };

  return {
    parsedData,
    setParsedData,
    csvFile,
    setCsvFile,
    isParsingCSV,
    setIsParsingCSV,
    isUploadingDocument,
    setIsUploadingDocument,
    documentFile,
    setDocumentFile,
    documentUrl,
    setDocumentUrl,
    isSubmitting,
    handleSubmitRepayments,
    handleCancelUpload
  };
}
