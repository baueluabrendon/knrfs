
import { useState } from "react";
import { toast } from "sonner";
import { DocumentUploadType } from "@/types/loan";
import { defaultDocuments } from "../default-values";
import { supabase } from "@/integrations/supabase/client";
import { 
  uploadDocument, 
  uploadApplicationDocument, 
  mapDocumentKeyToEnum 
} from "../document-uploader";

export function useDocumentUploader(applicationUuid: string) {
  const [documents, setDocuments] = useState<Record<string, DocumentUploadType>>({ ...defaultDocuments });
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const handleFileUpload = async (documentKey: string, file: File) => {
    setUploadingDocument(true);

    try {
      setDocuments(prev => ({
        ...prev,
        [documentKey]: { ...prev[documentKey], file }
      }));

      if (documentKey === 'applicationForm') {
        console.log(`Uploading ${documentKey} to storage...`);
        const documentUrl = await uploadApplicationDocument(
          file, 
          'applicationForm',
          applicationUuid
        );

        if (!documentUrl) {
          throw new Error(`Failed to upload ${documentKey}`);
        }

        console.log(`Successfully uploaded ${documentKey} to: ${documentUrl}`);
        console.log(`Checking if application record exists for ID: ${applicationUuid}`);

        const { data: existingApp, error: fetchError } = await supabase
          .from('applications')
          .select('application_id')
          .eq('application_id', applicationUuid)
          .maybeSingle();

        if (fetchError) {
          console.error('Error checking existing application:', fetchError);
          throw fetchError;
        }

        let updateResult;
        if (existingApp) {
          console.log(`Updating existing application record: ${applicationUuid}`);
          updateResult = await supabase
            .from('applications')
            .update({
              application_document_url: documentUrl,
              status: 'pending',
              uploaded_at: new Date().toISOString()
            })
            .eq('application_id', applicationUuid);
        } else {
          console.log(`Creating new application record with ID: ${applicationUuid}`);
          updateResult = await supabase
            .from('applications')
            .insert({
              application_id: applicationUuid,
              application_document_url: documentUrl,
              uploaded_at: new Date().toISOString(),
              status: 'pending'
            });
        }
            
        if (updateResult.error) {
          console.error('Error updating/creating application record:', updateResult.error);
          throw updateResult.error;
        }

        // Delay to allow the database to update
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Use maybeSingle instead of single to prevent errors when the record isn't found
        const { data: verifyApp, error: verifyError } = await supabase
          .from('applications')
          .select('application_document_url')
          .eq('application_id', applicationUuid)
          .maybeSingle();
        
        if (verifyError) {
          console.error('Error verifying application document URL:', verifyError);
        } else if (!verifyApp?.application_document_url) {
          console.warn('Application URL not yet available in DB, may need retry during processing');
        } else {
          console.log('Verified application_document_url is saved:', verifyApp.application_document_url);
        }

        toast.success(`${documents[documentKey].name} uploaded successfully`);
      } else {
        // This is a supporting document (terms and conditions, pay slip, etc.)
        // Verify document type is valid
        const documentTypeEnum = mapDocumentKeyToEnum(documentKey);

        if (!documentTypeEnum) {
          throw new Error(`Unknown document type: ${documentKey}`);
        }

        // Upload the supporting document
        const documentUrl = await uploadDocument(file, documentKey, applicationUuid);
        
        if (!documentUrl) {
          throw new Error(`Failed to upload ${documentKey}`);
        }

        console.log(`Successfully uploaded ${documentKey} to: ${documentUrl}`);
        
        // Insert record into documents table
        const { error } = await supabase
          .from('documents')
          .insert({
            application_id: applicationUuid,
            document_type: documentTypeEnum,
            document_path: documentUrl,
            uploaded_at: new Date().toISOString()
          });
        
        if (error) {
          console.error('Error saving document reference:', error);
          throw error;
        }
        
        toast.success(`${documents[documentKey].name} uploaded successfully`);
      }
    } catch (error) {
      console.error(`Error uploading ${documentKey}:`, error);
      toast.error(`Failed to upload ${documents[documentKey].name}`);
    } finally {
      setUploadingDocument(false);
    }
  };

  return {
    documents,
    uploadingDocument,
    handleFileUpload
  };
}
