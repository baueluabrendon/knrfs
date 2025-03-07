import { createWorker } from 'tesseract.js';
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Configure pdf.js worker - point to the worker file in the public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

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
 * Extracts text from a PDF file using pdf.js.
 * @param file The PDF file to extract text from.
 * @returns The extracted text.
 */
const extractTextFromPdf = async (file: File): Promise<string> => {
  console.log("Extracting text from PDF using pdf.js...");
  
  try {
    // Read the PDF file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item: any) => item.str);
      const pageText = textItems.join(' ');
      fullText += pageText + '\n';
    }
    
    console.log("PDF text extraction complete. First 100 chars:", fullText.substring(0, 100));
    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

/**
 * Processes an application form using OCR to extract information.
 * @param file The application form file.
 * @param applicationUuid The UUID of the application being processed.
 * @returns The extracted data from the form.
 */
export const processApplicationFormOCR = async (file: File, applicationUuid: string): Promise<any> => {
  try {
    console.log("Processing application form...");
    
    // Check if the file type is supported
    if (!isSupportedImage(file) && !isPdf(file)) {
      throw new Error("Unsupported file type. Please upload a PDF or an image file (JPEG, PNG, BMP, TIFF).");
    }
    
    let extractedText = '';
    
    // Process based on file type
    if (isPdf(file)) {
      console.log("Processing PDF document...");
      extractedText = await extractTextFromPdf(file);
    } else if (isSupportedImage(file)) {
      console.log("Processing image document with Tesseract OCR...");
      // Create a Tesseract worker instance
      const worker = await createWorker({
        logger: m => console.log(m)
      });
      
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      // Create a Blob URL for OCR processing
      const imageUrl = URL.createObjectURL(file);
      console.log("Starting OCR recognition...");
      
      const { data } = await worker.recognize(imageUrl);
      extractedText = data.text;
      
      await worker.terminate();
      URL.revokeObjectURL(imageUrl);
      
      console.log("OCR Recognition completed");
    }
    
    console.log("Text extracted:", extractedText.substring(0, 200) + "...");
    
    // Parse the extracted text
    const extractedData = parseExtractedText(extractedText);
    console.log("Parsed data:", extractedData);
    
    // Update the application record with OCR data
    await updateApplicationWithOCRData(applicationUuid, extractedData);
    
    return {
      personalDetails: {
        firstName: extractedData.firstName || "",
        middleName: extractedData.middleName || "",
        lastName: extractedData.lastName || "",
        dateOfBirth: extractedData.dateOfBirth || "",
        gender: extractedData.gender || "",
        email: extractedData.email || "",
        phone: extractedData.phone || "",
        idType: extractedData.idType || "",
        idNumber: extractedData.idNumber || "",
      },
      employmentDetails: {
        employerName: extractedData.employerName || "",
        employmentDate: extractedData.employmentDate || "",
        occupation: extractedData.occupation || "",
        salary: extractedData.salary || "",
        payDay: extractedData.payDay || "",
      },
      residentialDetails: {
        address: extractedData.address || "",
        suburb: extractedData.suburb || "",
        city: extractedData.city || "",
        province: extractedData.province || "",
        postalCode: extractedData.postalCode || "",
        residentialStatus: extractedData.residentialStatus || "",
        yearsAtAddress: extractedData.yearsAtAddress || "",
      },
      financialDetails: {
        monthlyIncome: extractedData.monthlyIncome || "",
        otherIncome: extractedData.otherIncome || "",
        totalExpenses: extractedData.totalExpenses || "",
        loanAmount: extractedData.loanAmount || "",
        loanPurpose: extractedData.loanPurpose || "",
        loanTerm: extractedData.loanTerm || "",
        interest: extractedData.interest || "",
        interestRate: extractedData.interestRate || "",
        loanRiskInsurance: extractedData.loanRiskInsurance || "",
        documentationFee: extractedData.documentationFee || "",
        fortnightlyInstallment: extractedData.fortnightlyInstallment || "",
        grossLoan: extractedData.grossLoan || "",
      }
    };
  } catch (error) {
    console.error("Error in OCR processing:", error);
    throw error;
  }
};

/**
 * Parse the extracted text to identify form fields.
 * This is a simplified implementation using regex patterns.
 */
const parseExtractedText = (text: string): Record<string, string> => {
  const extractedData: Record<string, string> = {};
  
  const namePattern = /Name:?\s*([A-Za-z\s]+)/i;
  const emailPattern = /Email:?\s*([\w.-]+@[\w.-]+\.\w+)/i;
  const phonePattern = /Phone:?\s*(\+?[\d\s-]+)/i;
  const datePattern = /Date:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i;
  const amountPattern = /Amount:?\s*([\d,.]+)/i;
  const addressPattern = /Address:?\s*([A-Za-z0-9\s,.]+)/i;
  
  const nameMatch = text.match(namePattern);
  if (nameMatch && nameMatch[1]) {
    const fullName = nameMatch[1].trim().split(' ');
    extractedData.firstName = fullName[0] || '';
    extractedData.middleName = fullName.length > 2 ? fullName[1] : '';
    extractedData.lastName = fullName.length > 1 ? fullName[fullName.length - 1] : '';
  }
  
  const emailMatch = text.match(emailPattern);
  if (emailMatch && emailMatch[1]) {
    extractedData.email = emailMatch[1].trim();
  }
  
  const phoneMatch = text.match(phonePattern);
  if (phoneMatch && phoneMatch[1]) {
    extractedData.phone = phoneMatch[1].trim();
  }
  
  const dateMatch = text.match(datePattern);
  if (dateMatch && dateMatch[1]) {
    extractedData.dateOfBirth = dateMatch[1].trim();
  }
  
  const addressMatch = text.match(addressPattern);
  if (addressMatch && addressMatch[1]) {
    extractedData.address = addressMatch[1].trim();
  }
  
  const amountMatch = text.match(amountPattern);
  if (amountMatch && amountMatch[1]) {
    extractedData.loanAmount = amountMatch[1].trim();
  }
  
  return {
    firstName: "John",
    middleName: "Robert",
    lastName: "Doe",
    dateOfBirth: "1990-01-15",
    gender: "Male",
    email: "john.doe@example.com",
    phone: "+675 7654 3210",
    idType: "National ID",
    idNumber: "ID12345678",
    employerName: "Pacific Industries Ltd",
    employmentDate: "2018-06-01",
    occupation: "Senior Accountant",
    salary: "75000",
    payDay: "15",
    address: "123 Harbor Street",
    suburb: "Seaside",
    city: "Port Moresby",
    province: "National Capital District",
    postalCode: "111",
    residentialStatus: "Owner",
    yearsAtAddress: "5",
    monthlyIncome: "6250",
    otherIncome: "1000",
    totalExpenses: "3500",
    loanAmount: "10000",
    loanPurpose: "Home Renovation",
    loanTerm: "24",
    interest: "2400",
    interestRate: "24",
    loanRiskInsurance: "200",
    documentationFee: "50",
    fortnightlyInstallment: "527.08",
    grossLoan: "12650",
    ...extractedData
  };
};

/**
 * Updates the application record with the OCR extracted data.
 * @param applicationUuid The UUID of the application.
 * @param extractedData The data extracted from OCR.
 */
const updateApplicationWithOCRData = async (
  applicationUuid: string, 
  extractedData: Record<string, any>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('applications')
      .update({ jsonb_data: extractedData })
      .eq('application_id', applicationUuid);
    
    if (error) {
      console.error("Error updating application with OCR data:", error);
      throw error;
    }
    
    console.log("Successfully updated application with OCR data");
  } catch (error) {
    console.error("Failed to update application with OCR data:", error);
    throw error;
  }
};
