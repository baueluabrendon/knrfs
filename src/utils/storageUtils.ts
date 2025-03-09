
import { supabase } from "@/integrations/supabase/client";

// Configuration constants
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'application_documents',
  RETRY_COUNT: 5,
  INITIAL_DELAY: 2500,
  SUBSEQUENT_DELAY: 3000,
  FOLDERS: {
    APPLICATIONS: 'applications',
    LOAN_DOCUMENTS: 'loan_documents',
    REPAYMENTS: 'repayment_documents'
  }
};

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
export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic function to upload a file to Supabase storage
 * @param file The file to upload
 * @param folderPath The folder path within the bucket
 * @param fileName The name to give the file
 * @param bucketName The storage bucket name (defaults to application_documents)
 * @returns The HTTPS public URL of the uploaded file or null if upload failed
 */
export const uploadFileToStorage = async (
  file: File,
  folderPath: string,
  fileName: string,
  bucketName: string = STORAGE_CONFIG.BUCKET_NAME
): Promise<string | null> => {
  try {
    const filePath = `${folderPath}/${fileName}`;
    console.log(`Uploading file to ${bucketName}/${filePath}...`);

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    // Ensure URL is HTTPS
    const publicUrl = data.publicUrl.replace('http://', 'https://');
    console.log(`Successfully uploaded file. Public URL: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadFileToStorage:', error);
    return null;
  }
};

/**
 * Retries an async operation with exponential backoff
 * @param operation The async operation to retry
 * @param maxRetries Maximum number of retries
 * @param initialDelayMs Initial delay in milliseconds
 * @param nextDelayMs Delay for subsequent retries
 * @returns The result of the operation or throws an error after all retries fail
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  description: string,
  maxRetries: number = STORAGE_CONFIG.RETRY_COUNT,
  initialDelayMs: number = STORAGE_CONFIG.INITIAL_DELAY,
  nextDelayMs: number = STORAGE_CONFIG.SUBSEQUENT_DELAY
): Promise<T> => {
  let retries = maxRetries;
  let lastError: Error | null = null;
  
  // Wait for any initial operations to complete before first attempt
  await delay(initialDelayMs);
  
  while (retries > 0) {
    console.log(`Attempt ${maxRetries+1-retries} of ${maxRetries} to ${description}`);
    
    try {
      const result = await operation();
      
      if (result) {
        return result;
      }
      
      console.log(`Attempt returned no result, retrying...`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Error during retry attempt: ${lastError.message}`);
    }
    
    retries--;
    if (retries > 0) {
      console.log(`Waiting ${nextDelayMs}ms before retry...`);
      await delay(nextDelayMs);
    }
  }
  
  throw new Error(`Operation '${description}' failed after ${maxRetries} attempts: ${lastError?.message || "No result returned"}`);
};
