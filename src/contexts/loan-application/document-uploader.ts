
import { supabase } from "@/integrations/supabase/client";

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

    const { data } = supabase.storage
      .from('application_documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadDocument:', error);
    return null;
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
      .from('repayment_documents')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading repayment document:', error);
      return null;
    }

    const { data } = supabase.storage
      .from('repayment_documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadGroupRepaymentDocument:', error);
    return null;
  }
};
