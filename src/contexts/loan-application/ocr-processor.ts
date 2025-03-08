
import { createWorker } from 'tesseract.js';
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
 * Reads an image file as a data URL.
 * @param file The file to read.
 * @returns Promise that resolves with the data URL.
 */
const readImageAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Processes an application form using Tesseract.js OCR to extract information.
 * @param file The application form file.
 * @param applicationUuid The UUID of the application being processed.
 * @returns The extracted data from the form.
 */
export const processApplicationFormOCR = async (file: File, applicationUuid: string): Promise<any> => {
  try {
    console.log(`Starting OCR processing with Tesseract.js for application ID: ${applicationUuid}`);
    console.log(`File details: name=${file.name}, type=${file.type}, size=${file.size} bytes`);
    
    // Check if the file type is supported
    if (!isSupportedImage(file) && !isPdf(file)) {
      console.error(`Unsupported file type: ${file.type}`);
      throw new Error("Unsupported file type. Please upload a PDF or an image file (JPEG, PNG, BMP, TIFF).");
    }
    
    if (isPdf(file)) {
      throw new Error("PDF processing is not supported in the client-side OCR implementation. Please upload an image file.");
    }
    
    // Read the image file
    const imageDataUrl = await readImageAsDataURL(file);
    
    console.log("Image loaded, initializing Tesseract worker...");
    
    // Initialize Tesseract worker with correct options format
    const worker = await createWorker({
      logger: progress => console.log('OCR Progress:', progress),
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      lang: 'eng'
    });
    
    console.log("Tesseract worker initialized, starting OCR...");
    
    // Perform OCR on the image
    const { data } = await worker.recognize(imageDataUrl);
    
    console.log("OCR completed, extracted text:", data.text.substring(0, 200) + "...");
    
    // Terminate worker to free resources
    await worker.terminate();
    
    // Basic parsing of the extracted text
    // This is a simple implementation - in a real app, you'd want more sophisticated parsing
    const extractedData = {
      personalDetails: {
        firstName: extractValue(data.text, 'first name', 20),
        lastName: extractValue(data.text, 'last name', 20),
        dateOfBirth: extractValue(data.text, 'date of birth', 10),
        email: extractValue(data.text, 'email', 30),
        phone: extractValue(data.text, 'phone', 15),
      },
      employmentDetails: {
        employerName: extractValue(data.text, 'employer', 30),
        position: extractValue(data.text, 'position', 30),
        employmentDate: extractValue(data.text, 'employment date', 10),
      },
      residentialDetails: {
        address: extractValue(data.text, 'address', 50),
        city: extractValue(data.text, 'city', 20),
        province: extractValue(data.text, 'province', 20),
      },
      financialDetails: {
        income: extractValue(data.text, 'income', 15),
        loanAmount: extractValue(data.text, 'loan amount', 15),
        loanTerm: extractValue(data.text, 'loan term', 10),
      }
    };
    
    console.log("Extracted structured data:", extractedData);
    
    // Update the application record in the database
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        jsonb_data: extractedData,
        updated_at: new Date().toISOString()
      })
      .eq('application_id', applicationUuid);
    
    if (updateError) {
      console.error("Error updating application with OCR data:", updateError);
      throw new Error(`Failed to store extracted data: ${updateError.message}`);
    }
    
    return extractedData;
  } catch (error: any) {
    console.error("Error in OCR processing:", error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
};

/**
 * Helper function to extract a value from text based on a label.
 * @param text The full text to search.
 * @param label The label to search for.
 * @param maxLength Maximum length of the value to extract.
 * @returns The extracted value or empty string.
 */
const extractValue = (text: string, label: string, maxLength: number): string => {
  const regex = new RegExp(`${label}[\\s:\\-]*([^\\n]{1,${maxLength}})`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
};
