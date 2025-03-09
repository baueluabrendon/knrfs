
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { isPdf, isSupportedImage } from "./ocr-processor";

// Type alias for document types
type DocumentType = Database['public']['Enums']['document_type_enum'];

/**
 * Uploads a document to Supabase storage for a loan application
 * @param file The file to upload
 * @param document_type The type of document being uploaded (e.g., "id", "payslip", "bank_statement")
 * @returns The URL of the uploaded document or null if upload failed
 */
export const uploadDocument = async (
  file: File,
  document_type: string,
  applicationUuid: string
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${applicationUuid}_${document_type}_${Date.now()}.${fileExt}`;
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
 * Uploads application form or terms and conditions to storage and returns the public URL
 * @param file The file to upload
 * @param applicationType The type of document ('applicationForm' or 'termsAndConditions')
 * @param applicationUuid The UUID of the application being processed
 * @returns The public URL of the uploaded file or null if upload failed
 */
export const uploadApplicationDocument = async (
  file: File,
  applicationType: 'applicationForm',
  applicationUuid: string
): Promise<string | null> => {
  try {
    // Check file type first
    if (!isPdf(file) && !isSupportedImage(file)) {
      throw new Error("Unsupported file type. Please upload a PDF or an image file (JPEG, PNG, BMP, TIFF).");
    }
    
    // Upload file with original format and extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${applicationUuid}_${applicationType}.${fileExt}`;
    const filePath = `applications/${fileName}`;
    
    console.log(`Uploading ${applicationType} as ${fileExt} file...`);
    
    const { error: uploadError } = await supabase.storage
      .from('application_documents')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error(`Error uploading ${applicationType}:`, uploadError);
      return null;
    }
    
    // Get public URL
    const { data } = supabase.storage
      .from('application_documents')
      .getPublicUrl(filePath);
    
    const publicUrl = data.publicUrl.replace('http://', 'https://');
    return publicUrl;
  } catch (error) {
    console.error(`Error in uploadApplicationDocument (${applicationType}):`, error);
    return null;
  }
};

/**
 * Maps document key to Supabase enum value
 * @param documentKey The document key from the frontend
 * @returns The corresponding enum value for the database
 */
export const mapDocumentKeyToEnum = (documentKey: string): DocumentType | null => {
  const documentTypeMap: Record<string, DocumentType> = {
    'termsAndConditions': 'Terms and Conditions',
    'paySlip1': 'Pay Slip 1',
    'paySlip2': 'Pay Slip 2',
    'paySlip3': 'Pay Slip 3',
    'bankStatement': '3 Months Bank Statement',
    'idDocument': 'ID Document',
    'salaryDeduction': 'Irrevocable Salary Deduction Authority',
    'employmentLetter': 'Employment Confirmation Letter',
    'dataEntryForm': 'Data Entry Form',
    'permanentVariation': 'Permanent Variation Advice',
    'nasfundForm': 'Nasfund Account Statement',
    'salaryDeductionConfirmation': 'Salary Deduction Confirmation Letter'
  };
  
  return documentTypeMap[documentKey] || null;
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

    const { data } = supabase.storage
      .from('application_documents')
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl.replace('http://', 'https://');
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadGroupRepaymentDocument:', error);
    return null;
  }
};
