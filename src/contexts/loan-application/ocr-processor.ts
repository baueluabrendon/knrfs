
import { supabase } from "@/integrations/supabase/client";
import { callProcessApplicationEdgeFunction } from "@/utils/edgeFunctionUtils";

/**
 * Checks if the file is a PDF.
 * @param file The file to check.
 * @returns True if the file is a PDF, false otherwise.
 */
export const isPdf = (file: File): boolean => {
  return file.type === 'application/pdf';
};

/**
 * Checks if the file is a supported image type.
 * @param file The file to check.
 * @returns True if the file is a supported image, false otherwise.
 */
export const isSupportedImage = (file: File): boolean => {
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
  return supportedTypes.includes(file.type);
};

/**
 * Processes an application form using Google Cloud Vision API through edge function
 * to extract information.
 * @param file The application form file.
 * @param applicationUuid The UUID of the application being processed.
 * @returns The extracted data from the form.
 */
export const processApplicationFormOCR = async (file: File, applicationUuid: string): Promise<any> => {
  try {
    console.log(`Starting OCR processing for application ID: ${applicationUuid}`);
    console.log(`File details: name=${file.name}, type=${file.type}, size=${file.size} bytes`);
    
    // Check if the file type is supported
    if (!isSupportedImage(file) && !isPdf(file)) {
      console.error(`Unsupported file type: ${file.type}`);
      throw new Error("Unsupported file type. Please upload a PDF or an image file (JPEG, PNG, BMP, TIFF).");
    }
    
    // Get the application document URL using maybeSingle() to handle missing records gracefully
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('application_document_url')
      .eq('application_id', applicationUuid)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching application document URL:', fetchError);
      throw new Error('Failed to retrieve application document URL');
    }
    
    if (!application || !application.application_document_url) {
      throw new Error('No application document URL found. Please upload the document first.');
    }
    
    console.log('Successfully retrieved application_document_url:', application.application_document_url);
    
    // Use the shared utility function to call the edge function
    const result = await callProcessApplicationEdgeFunction({
      application_id: applicationUuid,
      application_document_url: application.application_document_url,
      status: 'pending'
    });
    
    console.log('Edge function response:', result);
    
    // Fetch the updated application data with extracted information
    const { data: updatedApp, error: updateFetchError } = await supabase
      .from('applications')
      .select('jsonb_data')
      .eq('application_id', applicationUuid)
      .single();
      
    if (updateFetchError) {
      console.error('Error fetching processed application data:', updateFetchError);
      throw new Error('Failed to retrieve processed application data');
    }
    
    return updatedApp.jsonb_data;
  } catch (error: any) {
    console.error("Error in OCR processing:", error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
};
