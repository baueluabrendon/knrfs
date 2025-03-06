
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Uploads a document to Supabase storage for a loan application
 * @param file The file to upload
 * @param document_type The type of document being uploaded (e.g., "id", "payslip", "bank_statement")
 * @returns The URL of the uploaded document or null if upload failed
 */
export const uploadDocument = async (
  file: File,
  document_type: string
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${document_type}.${fileExt}`;
    const filePath = `loan_documents/${fileName}`;

    const { error } = await supabase.storage
      .from('application_documents')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    // Get HTTPS public URL
    const { data } = supabase.storage
      .from('application_documents')
      .getPublicUrl(filePath);

    // Ensure URL is HTTPS
    const publicUrl = data.publicUrl.replace('http://', 'https://');
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadDocument:', error);
    return null;
  }
};

/**
 * Uploads application form or terms and conditions to storage and updates applications table
 * @param file The file to upload
 * @param applicationType The type of document ('applicationForm' or 'termsAndConditions')
 * @param applicationUuid The UUID of the application being processed
 * @returns True if upload was successful, false otherwise
 */
export const uploadApplicationDocument = async (
  file: File,
  applicationType: 'applicationForm' | 'termsAndConditions',
  applicationUuid: string
): Promise<boolean> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${applicationUuid}_${applicationType}.${fileExt}`;
    const filePath = `applications/${fileName}`;
    
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('application_documents')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error(`Error uploading ${applicationType}:`, uploadError);
      return false;
    }
    
    // Get public URL
    const { data } = supabase.storage
      .from('application_documents')
      .getPublicUrl(filePath);
    
    // Determine which column to update based on document type
    const columnToUpdate = applicationType === 'applicationForm' 
      ? 'application_document_url' 
      : 'terms_and_conditions_url';
    
    // Update the application record with the document URL
    const { error } = await supabase
      .from('applications')
      .update({ [columnToUpdate]: data.publicUrl })
      .eq('application_id', applicationUuid);
    
    if (error) {
      console.error(`Error updating ${applicationType} URL:`, error);
      toast.error(`Failed to upload ${applicationType === 'applicationForm' ? 'Application Form' : 'Terms and Conditions'}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error in uploadApplicationDocument (${applicationType}):`, error);
    return false;
  }
};

/**
 * Uploads a group repayment document to Supabase storage
 * @param file The file to upload
 * @returns The URL of the uploaded document or null if upload failed
 */
export const uploadGroupRepaymentDocument = async (
  file: File
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_group_repayment.${fileExt}`;
    const filePath = `repayment_documents/${fileName}`;

    const { error } = await supabase.storage
      .from('application_documents')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading repayment document:', error);
      return null;
    }

    // Get HTTPS public URL
    const { data } = supabase.storage
      .from('application_documents')
      .getPublicUrl(filePath);

    // Ensure URL is HTTPS
    const publicUrl = data.publicUrl.replace('http://', 'https://');
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadGroupRepaymentDocument:', error);
    return null;
  }
};
