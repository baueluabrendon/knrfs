
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
    console.log("Processing application form using Supabase Edge Function...");
    
    // Check if the file type is supported
    if (!isSupportedImage(file) && !isPdf(file)) {
      throw new Error("Unsupported file type. Please upload a PDF or an image file (JPEG, PNG, BMP, TIFF).");
    }
    
    // Create a FormData instance
    const formData = new FormData();
    formData.append('file', file);
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('process-document', {
      method: 'POST',
      body: formData,
      headers: {
        // No custom headers needed for FormData
      },
      query: {
        application_id: applicationUuid
      }
    });
    
    if (error) {
      console.error("Error calling process-document function:", error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
    
    console.log("Document processed successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in OCR processing:", error);
    throw error;
  }
};
