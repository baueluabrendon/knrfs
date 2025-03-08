
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
 * Helper function to wait for a specified time
 * @param ms Time to wait in milliseconds
 * @returns A promise that resolves after the specified time
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    
    // Try to get the application URL with retries
    let application = null;
    let fetchError = null;
    let retries = 3;
    
    // Wait a bit for the upload transaction to complete before the first attempt
    await delay(1000);
    
    while (retries > 0 && !application) {
      console.log(`Attempt ${4-retries} to retrieve application document URL`);
      
      const result = await supabase
        .from('applications')
        .select('application_document_url')
        .eq('application_id', applicationUuid)
        .maybeSingle();
        
      fetchError = result.error;
      application = result.data;
      
      if (fetchError) {
        console.error('Error fetching application document URL:', fetchError);
        retries--;
        if (retries > 0) await delay(1500); // Wait before retry
        continue;
      }
      
      if (!application || !application.application_document_url) {
        console.log('Application found but URL is missing, retrying...');
        retries--;
        if (retries > 0) await delay(1500); // Wait before retry
        continue;
      }
      
      break; // Success, exit the loop
    }
    
    if (fetchError) {
      throw new Error('Failed to retrieve application document URL after multiple attempts');
    }
    
    if (!application || !application.application_document_url) {
      throw new Error('No application document URL found after multiple attempts. Please try again.');
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
