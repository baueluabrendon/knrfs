
import { useState } from "react";
import { toast } from "sonner";

// OpenAI API key configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * Processes an application form using OpenAI API for OCR and data extraction
 * @param file The application form file
 * @returns The extracted data from the form
 */
export const processApplicationFormOCR = async (file: File): Promise<any> => {
  try {
    console.log(`Starting OCR processing for file: ${file.name}`);
    console.log(`File type: ${file.type}, size: ${file.size} bytes`);
    
    // Convert file to base64
    const base64String = await fileToBase64(file);
    
    // Extract text using OpenAI's Vision API
    console.log("Sending document to OpenAI for text extraction");
    const extractedText = await extractTextWithOpenAI(base64String);
    
    console.log('Text extraction complete, parsing extracted data');
    console.log('Extracted text sample:', extractedText.substring(0, 200) + '...');
    
    // Extract structured form data using OpenAI
    console.log("Sending extracted text to OpenAI for structured data extraction");
    const extractedData = await extractFormDataWithOpenAI(extractedText);
    
    console.log('Extracted structured data:', extractedData);
    return extractedData;
  } catch (error: any) {
    console.error("Error in OCR processing:", error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
};

// Extract text from document using OpenAI's Vision API
async function extractTextWithOpenAI(base64String: string): Promise<string> {
  try {
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
