
import { useState } from "react";
import { toast } from "sonner";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "./pdfWorker"; // Import the local worker

// OpenAI API key configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Set PDF.js worker
GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Processes an application form using OpenAI API for OCR and data extraction
 * @param file The application form file
 * @returns The extracted data from the form
 */
export const processApplicationFormOCR = async (file: File): Promise<any> => {
  try {
    console.log(`Starting OCR processing for file: ${file.name}`);
    console.log(`File type: ${file.type}, size: ${file.size} bytes`);

    const base64String = file.type === "application/pdf"
      ? await pdfToImageBase64(file)
      : await fileToBase64(file);

    const extractedText = await extractTextWithOpenAI(base64String);
    console.log("Extracted text sample:", extractedText.substring(0, 200) + "...");

    const extractedData = await extractFormDataWithOpenAI(extractedText);
    console.log("Extracted structured data:", extractedData);

    return extractedData;
  } catch (error: any) {
    console.error("Error in OCR processing:", error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
};

// Convert single-page PDF to base64 PNG
async function pdfToImageBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context!, viewport }).promise;
  return canvas.toDataURL("image/png");
}

// Extract text using OpenAI Vision
async function extractTextWithOpenAI(base64String: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
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
    throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Extract structured data from text
async function extractFormDataWithOpenAI(text: string): Promise<any> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a data extraction system for loan application forms. 
          Extract the following information categories from the text and format them as a JSON object:
          
          personalDetails:
            - firstName
            - lastName
            - dateOfBirth
            - email
            - phone
            - gender
            - nationality
            - maritalStatus
          
          employmentDetails:
            - employerName
            - position
            - employmentDate
            - fileNumber
            - paymaster
            - workPhoneNumber
            - postalAddress
            - fax
          
          residentialDetails:
            - address
            - city
            - province
            - district
            - village
            - suburb
            - lot
            - section
            - streetName
            - spouseLastName
            - spouseFirstName
            - spouseEmployerName
            - spouseContactDetails
          
          financialDetails:
            - bank
            - bankBranch
            - bsbCode
            - accountName
            - accountNumber
            - accountType
            - income
            - netIncome
          
          loanDetails:
            - loanAmount
            - loanTerm
            - loanPurpose
            - fortnightlyInstallment
            - totalRepayable

          Return ONLY the JSON object with these fields, nothing else. Leave missing fields as empty strings.`
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
    throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// Convert image file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
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
      const extractedData = await processApplicationFormOCR(documents.applicationForm.file);
      return extractedData || null;
    } catch (error) {
      console.error("Error processing application form:", error);
      toast.error("Failed to process application form");
      throw error;
    } finally {
      setIsProcessingOCR(false);
    }
  };

  return {
    isProcessingOCR,
    processApplicationForm
  };
}
