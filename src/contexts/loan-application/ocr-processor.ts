
import { useState } from "react";
import { toast } from "sonner";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { createWorker } from 'tesseract.js';

// Set proper worker path for PDF.js (as fallback)
const pdfjsWorkerUrl = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.js',
  import.meta.url
).toString();

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

// OpenAI API key and configuration
const OPENAI_API_KEY = "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";
const USE_DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

/**
 * Processes an application form using OpenAI API for OCR and data extraction
 * Falls back to client-side OCR if OpenAI API fails or dev mode is enabled
 * @param file The application form file
 * @returns The extracted data from the form
 */
export const processApplicationFormOCR = async (file: File): Promise<any> => {
  try {
    console.log(`Starting OCR processing for file: ${file.name}`);
    console.log(`File type: ${file.type}, size: ${file.size} bytes`);
    
    let extractedText = '';
    
    // Try using OpenAI API for OCR unless in dev mode
    if (!USE_DEV_MODE) {
      try {
        console.log("Attempting to use OpenAI for OCR processing");
        extractedText = await extractTextWithOpenAI(file);
        console.log("OpenAI OCR processing complete");
      } catch (error) {
        console.error("Error using OpenAI for OCR, falling back to local processing:", error);
        toast.warning("Using fallback OCR method. Results may be less accurate.");
        
        // Fallback to local processing
        if (file.type.includes('pdf')) {
          console.log('Fallback: Processing PDF document locally');
          extractedText = await extractTextFromPdf(file);
        } else {
          console.log('Fallback: Processing image document with Tesseract');
          extractedText = await extractTextFromImage(file);
        }
      }
    } else {
      console.log("Dev mode enabled, using local OCR processing");
      // Use local processing in dev mode
      if (file.type.includes('pdf')) {
        console.log('Processing PDF document locally');
        extractedText = await extractTextFromPdf(file);
      } else {
        console.log('Processing image document with Tesseract');
        extractedText = await extractTextFromImage(file);
      }
    }
    
    console.log('Text extraction complete, parsing extracted data');
    console.log('Extracted text sample:', extractedText.substring(0, 200) + '...');
    
    // Clean up common OCR errors - strip extra spaces and normalize newlines
    const cleanedText = extractedText.replace(/\s{2,}/g, ' ').replace(/\n/g, ' ');
    console.log('Cleaned text sample:', cleanedText.substring(0, 200) + '...');
    
    // Try using OpenAI for document data extraction unless in dev mode
    let extractedData;
    if (!USE_DEV_MODE) {
      try {
        console.log("Attempting to use OpenAI for data extraction");
        extractedData = await extractFormDataWithOpenAI(cleanedText);
        console.log("OpenAI data extraction complete");
      } catch (error) {
        console.error("Error using OpenAI for data extraction, falling back to regex pattern matching:", error);
        toast.warning("Using fallback data extraction. Please verify the extracted information carefully.");
        extractedData = extractFormDataWithRegex(cleanedText);
      }
    } else {
      console.log("Dev mode enabled, using regex pattern matching for data extraction");
      extractedData = extractFormDataWithRegex(cleanedText);
    }
    
    console.log('Extracted structured data:', extractedData);
    return extractedData;
  } catch (error: any) {
    console.error("Error in OCR processing:", error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
};

// Extract text from document using OpenAI's Vision API
async function extractTextWithOpenAI(file: File): Promise<string> {
  try {
    // Convert file to base64
    const base64String = await fileToBase64(file);
    
    console.log("Sending document to OpenAI for text extraction");
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a precise OCR system. Extract all text from the provided document image or PDF. Return only the extracted text, nothing else."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text from this document:"
              },
              {
                type: "image_url",
                image_url: {
                  url: base64String
                }
              }
            ]
          }
        ],
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error in OpenAI text extraction:", error);
    throw error;
  }
}

// Use OpenAI to extract structured form data from text
async function extractFormDataWithOpenAI(text: string): Promise<any> {
  try {
    console.log("Sending extracted text to OpenAI for structured data extraction");
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a data extraction system for loan application forms. 
            Extract the following information categories from the text and format them as a JSON object:
            
            personalDetails:
              - firstName: first name of applicant
              - lastName: last name of applicant
              - dateOfBirth: date of birth
              - email: email address
              - phone: phone number
              - gender: gender
              - nationality: nationality
              - maritalStatus: marital status
            
            employmentDetails:
              - employerName: name of employer
              - position: job position
              - employmentDate: date of employment
              - fileNumber: file number
              - paymaster: paymaster
              - workPhoneNumber: work phone number
              - postalAddress: postal address
              - fax: fax number
            
            residentialDetails:
              - address: residential address
              - city: city
              - province: province
              - district: district
              - village: village
              - suburb: suburb
              - lot: lot number
              - section: section
              - streetName: street name
              - spouseLastName: spouse's last name
              - spouseFirstName: spouse's first name
              - spouseEmployerName: spouse's employer
              - spouseContactDetails: spouse's contact details
            
            financialDetails:
              - bank: bank name
              - bankBranch: bank branch
              - bsbCode: BSB code
              - accountName: account name
              - accountNumber: account number
              - accountType: account type
              - income: gross income
              - netIncome: net income
            
            loanDetails:
              - loanAmount: requested loan amount
              - loanTerm: loan term
              - loanPurpose: purpose of loan
              - fortnightlyInstallment: bi-weekly installment amount
              - totalRepayable: total repayable amount
            
            Return ONLY the JSON object with these fields, nothing else. If a field cannot be found, leave it as an empty string.`
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Error in OpenAI structured data extraction:", error);
    throw error;
  }
}

// Convert file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

// Extract form data using regex patterns (fallback method)
function extractFormDataWithRegex(text: string): any {
  return {
    personalDetails: {
      firstName: extractValue(text, 'first name|given name', 20),
      lastName: extractValue(text, 'last name|surname', 20),
      dateOfBirth: extractValue(text, 'date of birth', 10),
      email: extractValue(text, 'email', 30),
      phone: extractValue(text, 'phone|mobile number', 15),
      gender: extractValue(text, 'gender', 10),
      nationality: extractValue(text, 'nationality', 20),
      maritalStatus: extractValue(text, 'marital status', 15),
    },
    employmentDetails: {
      employerName: extractValue(text, 'employer|department|company', 30),
      position: extractValue(text, 'position', 30),
      employmentDate: extractValue(text, 'employment date|date employed', 10),
      fileNumber: extractValue(text, 'file number', 20),
      paymaster: extractValue(text, 'paymaster', 30),
      workPhoneNumber: extractValue(text, 'work phone', 15),
      postalAddress: extractValue(text, 'postal address', 50),
      fax: extractValue(text, 'fax', 15),
    },
    residentialDetails: {
      address: extractValue(text, 'address', 50),
      city: extractValue(text, 'city', 20),
      province: extractValue(text, 'province', 20),
      district: extractValue(text, 'district', 20),
      village: extractValue(text, 'village', 20),
      suburb: extractValue(text, 'suburb', 20),
      lot: extractValue(text, 'lot', 10),
      section: extractValue(text, 'section', 10),
      streetName: extractValue(text, 'street name', 30),
      spouseLastName: extractValue(text, 'spouse last name', 20),
      spouseFirstName: extractValue(text, 'spouse first name', 20),
      spouseEmployerName: extractValue(text, 'spouse employer', 30),
      spouseContactDetails: extractValue(text, 'spouse contact', 30),
    },
    financialDetails: {
      bank: extractValue(text, 'bank', 20),
      bankBranch: extractValue(text, 'bank branch', 20),
      bsbCode: extractValue(text, 'bsb code', 10),
      accountName: extractValue(text, 'account name', 30),
      accountNumber: extractValue(text, 'account number', 20),
      accountType: extractValue(text, 'account type', 15),
      income: extractValue(text, 'income|gross salary', 15),
      netIncome: extractValue(text, 'net income', 15),
    },
    loanDetails: {
      loanAmount: extractValue(text, 'loan amount', 15),
      loanTerm: extractValue(text, 'loan term', 10),
      loanPurpose: extractValue(text, 'purpose of loan', 50),
      fortnightlyInstallment: extractValue(text, 'bi-weekly installment|fortnightly installment', 15),
      totalRepayable: extractValue(text, 'total repayable', 15),
    }
  };
}

// Extract text from PDF using PDF.js (fallback method)
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

// Extract text from image using Tesseract.js (fallback method)
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
      console.log("Starting OCR processing of application form...");
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
