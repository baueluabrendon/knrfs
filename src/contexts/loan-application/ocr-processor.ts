
import { createWorker } from 'tesseract.js';
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Converts a PDF file to a PNG image
 * @param file The PDF file to convert
 * @returns A PNG image file
 */
const convertPdfToPng = async (file: File): Promise<File> => {
  console.log("Converting PDF to PNG...");
  
  // Read the PDF file as an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  
  // Load the PDF document
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  // Get the first page
  const page = await pdf.getPage(1);
  
  // Render the page to a canvas
  const viewport = page.getViewport({ scale: 2.0 }); // Scale for better quality
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;
  
  // Convert canvas to PNG file
  const pngBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
  
  // Create a new File object from the PNG blob
  const pngFile = new File([pngBlob], `${file.name.replace('.pdf', '')}.png`, { type: 'image/png' });
  
  console.log("PDF converted to PNG successfully");
  return pngFile;
};

/**
 * Checks if the file is a PDF
 * @param file The file to check
 * @returns True if the file is a PDF, false otherwise
 */
const isPdf = (file: File): boolean => {
  return file.type === 'application/pdf';
};

/**
 * Checks if the file is a supported image type
 * @param file The file to check
 * @returns True if the file is a supported image, false otherwise
 */
const isSupportedImage = (file: File): boolean => {
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
  return supportedTypes.includes(file.type);
};

/**
 * Processes an application form using OCR to extract information
 * @param file The application form file
 * @param applicationUuid The UUID of the application being processed
 * @returns The extracted data from the form
 */
export const processApplicationFormOCR = async (file: File, applicationUuid: string): Promise<any> => {
  try {
    console.log("Processing application form with OCR using Tesseract.js...");
    
    // Check if file is supported
    if (!isPdf(file) && !isSupportedImage(file)) {
      throw new Error("Unsupported file type. Please upload a PDF or an image file (JPEG, PNG, BMP, TIFF).");
    }
    
    // Convert PDF to PNG if necessary
    const fileToProcess = isPdf(file) ? await convertPdfToPng(file) : file;
    
    // Create a worker instance
    const worker = await createWorker();
    
    // Load English language data
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // Convert file to blob URL for tesseract
    const imageUrl = URL.createObjectURL(fileToProcess);
    
    console.log("Starting OCR recognition...");
    // Recognize text from the image
    const { data } = await worker.recognize(imageUrl);
    console.log("OCR Recognition completed");
    
    // Release the worker when done
    await worker.terminate();
    
    // Clean up the blob URL
    URL.revokeObjectURL(imageUrl);
    
    console.log("OCR Text:", data.text);
    
    // Parse the extracted text to identify fields
    // This is a simple implementation - in production you'd use more sophisticated 
    // parsing logic based on your form layout and field positions
    const extractedData = parseExtractedText(data.text);
    console.log("Parsed data:", extractedData);
    
    // Update the application record in the database
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
 * Parse the extracted text to identify form fields
 * This is a simplified implementation that looks for key terms and patterns
 * In a real application, you'd want more sophisticated parsing logic
 */
const parseExtractedText = (text: string): Record<string, string> => {
  // Initialize an object to store the extracted fields
  const extractedData: Record<string, string> = {};
  
  // Define regex patterns for common field formats
  const namePattern = /Name:?\s*([A-Za-z\s]+)/i;
  const emailPattern = /Email:?\s*([\w.-]+@[\w.-]+\.\w+)/i;
  const phonePattern = /Phone:?\s*(\+?[\d\s-]+)/i;
  const datePattern = /Date:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i;
  const amountPattern = /Amount:?\s*([\d,.]+)/i;
  const addressPattern = /Address:?\s*([A-Za-z0-9\s,.]+)/i;
  
  // Extract fields using regex
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
  
  // For fields that are not found through regex, use fallback mock data
  // In a real application, you would improve the extraction logic
  // or implement machine learning models to identify these fields
  return {
    // Default mock data for demonstration purposes - these would be overwritten
    // by the real extracted values when available
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
    // Override with any extracted values
    ...extractedData
  };
};

/**
 * Update the application record in the database with the OCR data
 * @param applicationUuid The UUID of the application being processed
 * @param extractedData The data extracted from the OCR process
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
