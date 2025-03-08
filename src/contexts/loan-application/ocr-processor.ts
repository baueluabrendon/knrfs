
import { supabase } from "@/integrations/supabase/client";

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
 * Processes an application form using Supabase Edge Function to extract information.
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
    
    // Create a FormData instance
    const formData = new FormData();
    formData.append('file', file);
    
    console.log("Sending document to Supabase Edge Function for processing...");
    
    // Call the Supabase Edge Function with application_id as part of the URL
    const functionPath = `process-document?application_id=${encodeURIComponent(applicationUuid)}`;
    
    const { data, error } = await supabase.functions.invoke(functionPath, {
      method: 'POST',
      body: formData,
      headers: {
        // No custom headers needed for FormData
      }
    });
    
    if (error) {
      console.error("Error calling process-document function:", error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
    
    if (!data) {
      console.error("No data returned from process-document function");
      throw new Error("No data could be extracted from the document");
    }
    
    console.log("Document processed successfully with extracted data:", data);
    return data;
  } catch (error: any) {
    console.error("Error in OCR processing:", error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
};
