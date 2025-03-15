
import { supabase } from "@/integrations/supabase/client";
import { callProcessApplicationEdgeFunction } from "@/utils/edgeFunctionUtils";
import { 
  isPdf, 
  isSupportedImage, 
  retryOperation,
  STORAGE_CONFIG
} from "@/utils/storageUtils";
import { toast } from "sonner";
import { useState } from "react";

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
    
    // Define the operation to retrieve the application document URL
    const getApplicationDocumentUrl = async () => {
      console.log(`Attempting to retrieve application document URL for ID: ${applicationUuid}`);
      
      const result = await supabase
        .from('applications')
        .select('application_document_url, status')
        .eq('application_id', applicationUuid)
        .maybeSingle();
        
      if (result.error) {
        console.error('Error fetching application document URL:', result.error);
        throw result.error;
      }
      
      if (!result.data) {
        console.log('Application not found in database');
        return null;
      }
      
      if (!result.data.application_document_url) {
        console.log('Application found but URL is missing');
        
        // Try to verify document in storage directly
        const fileExt = file.name.split('.').pop();
        const fileName = `${applicationUuid}_applicationForm.${fileExt}`;
        const filePath = `applications/${fileName}`;
        
        // Check if the file exists in storage
        const fileData = supabase.storage
          .from(STORAGE_CONFIG.BUCKET_NAME)
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
            // Force another query immediately
            const updatedResult = await supabase
              .from('applications')
              .select('application_document_url, status')
              .eq('application_id', applicationUuid)
              .maybeSingle();
              
            return updatedResult.data;
          }
        }
        
        return null;
      }
      
      return result.data;
    };
    
    // Use the retry operation utility to get the application document URL
    const application = await retryOperation(
      getApplicationDocumentUrl, 
      "retrieve application document URL"
    );
    
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
    return result.data || {};
  } catch (error: any) {
    console.error("Error in OCR processing:", error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
};

/**
 * Hook for OCR processing
 */
export function useOcrProcessor(
  documents: Record<string, any>, 
  applicationUuid: string
) {
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  const processApplicationForm = async (): Promise<any> => {
    if (!documents.applicationForm?.file) {
      toast.error("No application form uploaded");
      return null;
    }
    
    setIsProcessingOCR(true);
    
    try {
      console.log("Starting OCR processing of application form...");
      const extractedData = await processApplicationFormOCR(documents.applicationForm.file, applicationUuid);
      
      if (extractedData) {
        console.log("Successfully extracted data from application form:", extractedData);
        return extractedData;
      }
      return null;
    } catch (error) {
      console.error("Error processing application form:", error);
      toast.error("Failed to process application form");
      throw error; // Re-throw to allow for custom error handling in UI
    } finally {
      setIsProcessingOCR(false);
    }
  };

  return {
    isProcessingOCR,
    processApplicationForm
  };
}
