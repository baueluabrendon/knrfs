
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
 * Try to directly create/update application record in the database
 * @param applicationUuid The UUID of the application being processed
 * @param applicationUrl The URL of the application document
 * @returns Success state
 */
const ensureApplicationRecordExists = async (
  applicationUuid: string,
  applicationUrl?: string
): Promise<boolean> => {
  try {
    // Check if application already exists
    const { data: existingApp, error: checkError } = await supabase
      .from('applications')
      .select('application_id, application_document_url')
      .eq('application_id', applicationUuid)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking application record:', checkError);
      return false;
    }
    
    if (existingApp) {
      console.log('Application record exists:', existingApp);
      
      // If we have a URL but the record doesn't, update it
      if (applicationUrl && !existingApp.application_document_url) {
        console.log('Updating existing application with URL:', applicationUrl);
        const { error: updateError } = await supabase
          .from('applications')
          .update({ 
            application_document_url: applicationUrl,
            updated_at: new Date().toISOString() 
          })
          .eq('application_id', applicationUuid);
          
        if (updateError) {
          console.error('Error updating application record:', updateError);
          return false;
        }
        
        return true;
      }
      
      return true;
    } else {
      // Application doesn't exist, create it
      console.log('Creating new application record:', applicationUuid);
      const { error: insertError } = await supabase
        .from('applications')
        .insert({
          application_id: applicationUuid,
          application_document_url: applicationUrl,
          status: 'pending',
          uploaded_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Error creating application record:', insertError);
        return false;
      }
      
      return true;
    }
  } catch (error) {
    console.error('Error ensuring application record exists:', error);
    return false;
  }
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
    
    // First, ensure the application record exists in the database
    await ensureApplicationRecordExists(applicationUuid);
    
    // Wait longer for the upload transaction to complete before the first attempt
    await delay(3000); // Increased from 2500ms to 3000ms
    
    // Try to get the application URL with increased retries and longer delays
    let application = null;
    let fetchError = null;
    let retries = 7; // Increased from 5 to 7
    
    while (retries > 0 && !application) {
      console.log(`Attempt ${8-retries} of 7 to retrieve application document URL`);
      
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
          console.log(`Waiting ${3000}ms before retry...`);
          await delay(3000); // Increased from 2500ms to 3000ms
        }
        continue;
      }
      
      if (!application) {
        console.log('Application not found in database, retrying...');
        
        // Try to create the application record directly
        if (retries === 4) {
          console.log('Attempt to create application record directly...');
          await ensureApplicationRecordExists(applicationUuid);
        }
        
        retries--;
        if (retries > 0) {
          console.log(`Waiting ${3000}ms before retry...`);
          await delay(3000);
        }
        continue;
      }
      
      if (!application.application_document_url) {
        console.log('Application found but URL is missing, retrying...');
        
        // Check if we have already waited enough and should verify storage directly
        if (retries <= 4) {
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
            const publicUrl = fileData.data.publicUrl.replace('http://', 'https://');
            
            const updateSuccess = await ensureApplicationRecordExists(applicationUuid, publicUrl);
            if (updateSuccess) {
              console.log('Successfully updated application with URL from storage');
              // Force a short delay then retry immediately
              await delay(1000);
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
