
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
 * to extract information without saving to the database.
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
    
    // Try to get the application URL with increased retries and longer delays
    let application = null;
    let fetchError = null;
    let retries = 5; 
    
    // Wait for the upload transaction to complete before the first attempt
    await delay(2500); 
    
    while (retries > 0 && !application) {
      console.log(`Attempt ${6-retries} of 5 to retrieve application document URL`);
      
      const result = await supabase
        .from('applications')
        .select('application_document_url, status')
        .eq('application_id', applicationUuid)
        .maybeSingle();
        
      fetchError = result.error;
      application = result.data;
      
      if (fetchError) {
        console.error('Error fetching application document URL:', fetchError);
        retries--;
        if (retries > 0) {
          console.log(`Waiting ${2500}ms before retry...`);
          await delay(2500);
        }
        continue;
      }
      
      if (!application) {
        console.log('Application not found in database, retrying...');
        retries--;
        if (retries > 0) {
          console.log(`Waiting ${2500}ms before retry...`);
          await delay(2500);
        }
        continue;
      }
      
      if (!application.application_document_url) {
        console.log('Application found but URL is missing, retrying...');
        // Check if we have already waited enough and should verify storage directly
        if (retries === 2) {
          console.log('Trying to verify document in storage directly...');
          const fileExt = file.name.split('.').pop();
          const fileName = `${applicationUuid}_applicationForm.${fileExt}`;
          const filePath = `applications/${fileName}`;
          
          // Check if the file exists in storage
          const fileData = supabase.storage
            .from('application_documents')
            .getPublicUrl(filePath);
            
          if (fileData.data) {
            console.log('Found file in storage, updating application record with URL:', fileData.data.publicUrl);
            // Update the application record with the URL
            const { error: updateError } = await supabase
              .from('applications')
              .update({ application_document_url: fileData.data.publicUrl.replace('http://', 'https://') })
              .eq('application_id', applicationUuid);
              
            if (updateError) {
              console.error('Error updating application with URL:', updateError);
            } else {
              // Try again immediately
              continue;
            }
          }
        }
        
        retries--;
        if (retries > 0) {
          console.log(`Waiting ${3000}ms before retry...`);
          await delay(3000);
        }
        continue;
      }
      
      break; // Success, exit the loop
    }
    
    if (fetchError) {
      throw new Error(`Failed to retrieve application document URL after multiple attempts: ${fetchError.message}`);
    }
    
    if (!application || !application.application_document_url) {
      throw new Error('No application document URL found after multiple attempts. Please try again.');
    }
    
    console.log('Successfully retrieved application_document_url:', application.application_document_url);
    
    // Use the shared utility function to call the edge function
    const result = await callProcessApplicationEdgeFunction({
      application_id: applicationUuid,
      application_document_url: application.application_document_url,
      status: application.status || 'pending'
    });
    
    console.log('Edge function response:', result);
    
    // Return the extracted data from the edge function response
    // This is the critical change - we don't update the database with jsonb_data yet
    // We just return the extracted data to be used to prefill the form
    return result.data || {};
  } catch (error: any) {
    console.error("Error in OCR processing:", error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
};
