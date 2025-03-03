
import { supabase } from "@/integrations/supabase/client";
import { DocumentUploadType } from "@/types/loan";
import { toast } from "sonner";

/**
 * Uploads a document to Supabase storage and records it in the appropriate table
 */
export async function uploadDocumentToSupabase(
  documentKey: string,
  file: File,
  applicationUuid: string
): Promise<boolean> {
  try {
    // 1. Sanitize the filename
    const fileExt = file.name.split('.').pop();
    const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
    const sanitizedFileName = fileNameWithoutExt.replace(/[^\x00-\x7F]/g, '');
    const finalFileName = sanitizedFileName 
      ? `${sanitizedFileName}.${fileExt}` 
      : `${documentKey}_${new Date().toISOString().slice(0, -5)}.${fileExt}`;
    
    // 2. Create a unique path for the file
    const filePath = `applications/${applicationUuid}/${documentKey}_${crypto.randomUUID()}.${fileExt}`;
    
    console.log(`Uploading ${documentKey} to ${filePath}`);
    
    // 3. Upload the file to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });
      
    if (storageError) {
      console.error("Error uploading file to storage:", storageError);
      toast.error(`Failed to upload ${documentKey}: ${storageError.message}`);
      return false;
    }
    
    // 4. Record the document in the appropriate table based on document type
    if (documentKey === "applicationForm") {
      // Store application form in the applications table
      const { error: dbError } = await supabase
        .from('applications')
        .insert({
          application_id: applicationUuid,
          document: filePath,
          uploaded_at: new Date().toISOString()
        });
        
      if (dbError) {
        console.error("Error recording application in database:", dbError);
        toast.error(`Failed to record application: ${dbError.message}`);
        return false;
      }
    } else {
      // Store supporting documents in the documents table
      // We need to ensure document_type is one of the allowed types from DocumentUploadType
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          application_uuid: applicationUuid,
          document_type: documentKey as DocumentUploadType,
          document_path: filePath,
          uploaded_at: new Date().toISOString()
        });
        
      if (dbError) {
        console.error("Error recording document in database:", dbError);
        toast.error(`Failed to record ${documentKey} in database: ${dbError.message}`);
        return false;
      }
    }
    
    console.log(`Successfully uploaded and recorded ${documentKey}`);
    return true;
  } catch (error) {
    console.error("Unexpected error during document upload:", error);
    toast.error(`Failed to process ${documentKey}: ${error.message || 'Unknown error'}`);
    return false;
  }
}

/**
 * Generate a unique application UUID to group documents together
 */
export function generateApplicationUuid(): string {
  return crypto.randomUUID();
}

/**
 * Uploads a receipt document to Supabase storage and records it in the repayments table
 */
export async function uploadReceiptToSupabase(
  file: File,
  loanId: string,
  repaymentId?: string
): Promise<boolean> {
  try {
    // 1. Sanitize the filename
    const fileExt = file.name.split('.').pop();
    const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
    const sanitizedFileName = fileNameWithoutExt.replace(/[^\x00-\x7F]/g, '');
    const finalFileName = sanitizedFileName 
      ? `${sanitizedFileName}.${fileExt}` 
      : `receipt_${new Date().toISOString().slice(0, -5)}.${fileExt}`;
    
    // 2. Create a unique path for the file
    const filePath = `repayments/${loanId}/${crypto.randomUUID()}.${fileExt}`;
    
    console.log(`Uploading receipt to ${filePath}`);
    
    // 3. Upload the file to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });
      
    if (storageError) {
      console.error("Error uploading receipt to storage:", storageError);
      toast.error(`Failed to upload receipt: ${storageError.message}`);
      return false;
    }
    
    // 4. If a repaymentId is provided, update the existing repayment record
    if (repaymentId) {
      const { error: dbError } = await supabase
        .from('repayments')
        .update({ receipt: filePath })
        .eq('repayment_id', repaymentId);
        
      if (dbError) {
        console.error("Error updating repayment record:", dbError);
        toast.error(`Failed to update repayment with receipt: ${dbError.message}`);
        return false;
      }
    }
    
    console.log(`Successfully uploaded receipt`);
    return true;
  } catch (error) {
    console.error("Unexpected error during receipt upload:", error);
    toast.error(`Failed to process receipt: ${error.message || 'Unknown error'}`);
    return false;
  }
}

/**
 * Uploads a group repayment document to Supabase storage and records it
 */
export async function uploadGroupRepaymentDocument(
  file: File
): Promise<string | null> {
  try {
    // 1. Sanitize the filename
    const fileExt = file.name.split('.').pop();
    const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
    const sanitizedFileName = fileNameWithoutExt.replace(/[^\x00-\x7F]/g, '');
    const finalFileName = sanitizedFileName 
      ? `${sanitizedFileName}.${fileExt}` 
      : `group_repayment_${new Date().toISOString().slice(0, -5)}.${fileExt}`;
    
    // 2. Create a unique path for the file
    const filePath = `group_repayments/${crypto.randomUUID()}.${fileExt}`;
    
    console.log(`Uploading group repayment document to ${filePath}`);
    
    // 3. Upload the file to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });
      
    if (storageError) {
      console.error("Error uploading group repayment document to storage:", storageError);
      toast.error(`Failed to upload group repayment document: ${storageError.message}`);
      return null;
    }
    
    return filePath;
  } catch (error) {
    console.error("Unexpected error during group repayment document upload:", error);
    toast.error(`Failed to process group repayment document: ${error.message || 'Unknown error'}`);
    return null;
  }
}
