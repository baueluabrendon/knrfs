
import { useState } from "react";
import { toast } from "sonner";
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Set proper worker path for PDF.js
const pdfjsWorkerUrl = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.js',
  import.meta.url
).toString();

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

/**
 * Processes an application form using client-side OCR (Tesseract.js for images, PDF.js for PDFs)
 * @param file The application form file
 * @returns The extracted data from the form
 */
export const processApplicationFormOCR = async (file: File): Promise<any> => {
  try {
    console.log(`Starting client-side OCR processing for file: ${file.name}`);
    console.log(`File type: ${file.type}, size: ${file.size} bytes`);
    
    let extractedText = '';
    
    if (file.type.includes('pdf')) {
      console.log('Processing PDF document');
      extractedText = await extractTextFromPdf(file);
    } else {
      console.log('Processing image document');
      extractedText = await extractTextFromImage(file);
    }
    
    console.log('Text extraction complete, parsing extracted data');
    console.log('Extracted text sample:', extractedText.substring(0, 200) + '...');
    
    // Clean up common OCR errors - strip extra spaces and normalize newlines
    const cleanedText = extractedText.replace(/\s{2,}/g, ' ').replace(/\n/g, ' ');
    console.log('Cleaned text sample:', cleanedText.substring(0, 200) + '...');
    
    // Parse the extracted text to get structured data that matches our form structure
    const extractedData = {
      personalDetails: {
        firstName: extractValue(cleanedText, 'first name|given name', 20),
        lastName: extractValue(cleanedText, 'last name|surname', 20),
        dateOfBirth: extractValue(cleanedText, 'date of birth', 10),
        email: extractValue(cleanedText, 'email', 30),
        phone: extractValue(cleanedText, 'phone|mobile number', 15),
        gender: extractValue(cleanedText, 'gender', 10),
        nationality: extractValue(cleanedText, 'nationality', 20),
        maritalStatus: extractValue(cleanedText, 'marital status', 15),
      },
      employmentDetails: {
        employerName: extractValue(cleanedText, 'employer|department|company', 30),
        position: extractValue(cleanedText, 'position', 30),
        employmentDate: extractValue(cleanedText, 'employment date|date employed', 10),
        fileNumber: extractValue(cleanedText, 'file number', 20),
        paymaster: extractValue(cleanedText, 'paymaster', 30),
        workPhoneNumber: extractValue(cleanedText, 'work phone', 15),
        postalAddress: extractValue(cleanedText, 'postal address', 50),
        fax: extractValue(cleanedText, 'fax', 15),
      },
      residentialDetails: {
        address: extractValue(cleanedText, 'address', 50),
        city: extractValue(cleanedText, 'city', 20),
        province: extractValue(cleanedText, 'province', 20),
        district: extractValue(cleanedText, 'district', 20),
        village: extractValue(cleanedText, 'village', 20),
        suburb: extractValue(cleanedText, 'suburb', 20),
        lot: extractValue(cleanedText, 'lot', 10),
        section: extractValue(cleanedText, 'section', 10),
        streetName: extractValue(cleanedText, 'street name', 30),
        spouseLastName: extractValue(cleanedText, 'spouse last name', 20),
        spouseFirstName: extractValue(cleanedText, 'spouse first name', 20),
        spouseEmployerName: extractValue(cleanedText, 'spouse employer', 30),
        spouseContactDetails: extractValue(cleanedText, 'spouse contact', 30),
      },
      financialDetails: {
        bank: extractValue(cleanedText, 'bank', 20),
        bankBranch: extractValue(cleanedText, 'bank branch', 20),
        bsbCode: extractValue(cleanedText, 'bsb code', 10),
        accountName: extractValue(cleanedText, 'account name', 30),
        accountNumber: extractValue(cleanedText, 'account number', 20),
        accountType: extractValue(cleanedText, 'account type', 15),
        income: extractValue(cleanedText, 'income|gross salary', 15),
        netIncome: extractValue(cleanedText, 'net income', 15),
      },
      loanDetails: {
        loanAmount: extractValue(cleanedText, 'loan amount', 15),
        loanTerm: extractValue(cleanedText, 'loan term', 10),
        loanPurpose: extractValue(cleanedText, 'purpose of loan', 50),
        fortnightlyInstallment: extractValue(cleanedText, 'bi-weekly installment|fortnightly installment', 15),
        totalRepayable: extractValue(cleanedText, 'total repayable', 15),
      }
    };
    
    console.log('Extracted structured data:', extractedData);
    return extractedData;
  } catch (error: any) {
    console.error("Error in client-side OCR processing:", error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
};

// Extract text from PDF using PDF.js
async function extractTextFromPdf(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      console.log(`PDF loaded with ${pdf.numPages} pages`);
      let fullText = '';
      
      // Process up to first 5 pages only (for performance)
      const maxPages = Math.min(pdf.numPages, 5);
      
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + ' ';
        console.log(`Extracted text from page ${i}`);
      }
      
      resolve(fullText);
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      reject(error);
    }
  });
}

// Extract text from image using Tesseract.js
async function extractTextFromImage(file: File): Promise<string> {
  try {
    console.log('Initializing Tesseract worker');
    
    // Create worker with proper API for Tesseract.js v4
    const worker = await createWorker();
    
    console.log('Worker created, beginning OCR process');
    
    // Convert file to image URL
    const imageUrl = URL.createObjectURL(file);
    
    // Properly initialize with the current API
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // Recognize text
    console.log('Starting Tesseract OCR processing...');
    const result = await worker.recognize(imageUrl);
    
    // Check confidence level and warn if low
    const confidence = result.data.confidence;
    console.log(`OCR completed with confidence level: ${confidence}%`);
    
    if (confidence < 70) {
      console.warn("Low OCR confidence:", confidence);
      toast.warning("OCR result may be inaccurate. Please verify extracted data carefully.");
    }
    
    console.log('Tesseract OCR processing complete');
    
    // Clean up
    URL.revokeObjectURL(imageUrl);
    await worker.terminate();
    
    return result.data.text;
  } catch (error) {
    console.error('Error processing image with Tesseract:', error);
    throw error;
  }
}

// Helper function to extract values from text with support for multiple labels
function extractValue(text: string, label: string, maxLength: number): string {
  // Support multiple label variations separated by |
  const labelVariations = label.split('|');
  let value = '';
  
  for (const labelVar of labelVariations) {
    const regex = new RegExp(`${labelVar}[\\s:\\-]*([^\\n]{1,${maxLength}})`, 'i');
    const match = text.match(regex);
    if (match) {
      value = match[1].trim();
      break;
    }
  }
  
  return value;
}

/**
 * Hook for OCR processing
 */
export function useOcrProcessor(documents: Record<string, any>) {
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  const processApplicationForm = async (): Promise<any> => {
    if (!documents.applicationForm?.file) {
      toast.error("No application form uploaded");
      return null;
    }
    
    setIsProcessingOCR(true);
    
    try {
      console.log("Starting client-side OCR processing of application form...");
      const extractedData = await processApplicationFormOCR(documents.applicationForm.file);
      
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
