
import { useState } from "react";
import { toast } from "sonner";
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Set up PDF.js worker - using a fixed CDN URL instead of relying on version property
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

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
    
    // Parse the extracted text to get structured data that matches our form structure
    const extractedData = {
      personalDetails: {
        firstName: extractValue(extractedText, 'first name|given name', 20),
        lastName: extractValue(extractedText, 'last name|surname', 20),
        dateOfBirth: extractValue(extractedText, 'date of birth', 10),
        email: extractValue(extractedText, 'email', 30),
        phone: extractValue(extractedText, 'phone|mobile number', 15),
        gender: extractValue(extractedText, 'gender', 10),
        nationality: extractValue(extractedText, 'nationality', 20),
        maritalStatus: extractValue(extractedText, 'marital status', 15),
      },
      employmentDetails: {
        employerName: extractValue(extractedText, 'employer|department|company', 30),
        position: extractValue(extractedText, 'position', 30),
        employmentDate: extractValue(extractedText, 'employment date|date employed', 10),
        fileNumber: extractValue(extractedText, 'file number', 20),
        paymaster: extractValue(extractedText, 'paymaster', 30),
        workPhoneNumber: extractValue(extractedText, 'work phone', 15),
        postalAddress: extractValue(extractedText, 'postal address', 50),
        fax: extractValue(extractedText, 'fax', 15),
      },
      residentialDetails: {
        address: extractValue(extractedText, 'address', 50),
        city: extractValue(extractedText, 'city', 20),
        province: extractValue(extractedText, 'province', 20),
        district: extractValue(extractedText, 'district', 20),
        village: extractValue(extractedText, 'village', 20),
        suburb: extractValue(extractedText, 'suburb', 20),
        lot: extractValue(extractedText, 'lot', 10),
        section: extractValue(extractedText, 'section', 10),
        streetName: extractValue(extractedText, 'street name', 30),
        spouseLastName: extractValue(extractedText, 'spouse last name', 20),
        spouseFirstName: extractValue(extractedText, 'spouse first name', 20),
        spouseEmployerName: extractValue(extractedText, 'spouse employer', 30),
        spouseContactDetails: extractValue(extractedText, 'spouse contact', 30),
      },
      financialDetails: {
        bank: extractValue(extractedText, 'bank', 20),
        bankBranch: extractValue(extractedText, 'bank branch', 20),
        bsbCode: extractValue(extractedText, 'bsb code', 10),
        accountName: extractValue(extractedText, 'account name', 30),
        accountNumber: extractValue(extractedText, 'account number', 20),
        accountType: extractValue(extractedText, 'account type', 15),
        income: extractValue(extractedText, 'income|gross salary', 15),
        netIncome: extractValue(extractedText, 'net income', 15),
      },
      loanDetails: {
        loanAmount: extractValue(extractedText, 'loan amount', 15),
        loanTerm: extractValue(extractedText, 'loan term', 10),
        loanPurpose: extractValue(extractedText, 'purpose of loan', 50),
        fortnightlyInstallment: extractValue(extractedText, 'bi-weekly installment|fortnightly installment', 15),
        totalRepayable: extractValue(extractedText, 'total repayable', 15),
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
    // Using the correct Tesseract.js API (compatible with v4+)
    const worker = await createWorker({
      logger: m => console.log(`Tesseract: ${m.status} - ${Math.floor(m.progress * 100)}%`),
    });
    
    console.log('Worker created, beginning OCR process');
    
    // Convert file to image URL
    const imageUrl = URL.createObjectURL(file);
    
    // Recognize text with proper API
    console.log('Starting Tesseract OCR processing...');
    const result = await worker.recognize(imageUrl);
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
