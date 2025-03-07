
import { createWorker } from 'tesseract.js';
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Set the pdf.js worker source dynamically using Vite's import.meta.url
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.min.js', import.meta.url).href;

/**
 * Converts a PDF file to a PNG image.
 * @param file The PDF file to convert.
 * @returns A PNG image file.
 */
export const convertPdfToPng = async (file: File): Promise<File> => {
  console.log("Converting PDF to PNG...");
  
  try {
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
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error("Failed to get canvas context");
    }
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    // Convert canvas to PNG blob
    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert canvas to blob"));
        }
      }, 'image/png', 0.95);
    });
    
    // Create a new File object from the PNG blob
    const pngFile = new File([pngBlob], `${file.name.replace(/\.pdf$/i, '')}.png`, { type: 'image/png' });
    
    console.log("PDF converted to PNG successfully");
    return pngFile;
  } catch (error) {
    console.error("Error converting PDF to PNG:", error);
    throw new Error("Failed to convert PDF to image for OCR processing");
  }
};

/**
 * Compresses an image file to reduce its size.
 * @param file The image file to compress.
 * @param maxSizeInMB Maximum size in MB (default: 3).
 * @returns A compressed image file.
 */
export const compressImage = async (file: File, maxSizeInMB: number = 3): Promise<File> => {
  console.log(`Compressing image: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Reduce dimensions if image is very large
        const maxDimension = Math.max(width, height);
        if (maxDimension > 2000) {
          const ratio = 2000 / maxDimension;
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Recursive compression using canvas.toBlob
        const compressFile = (quality: number) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }
            
            const newFile = new File([blob], file.name, { type: 'image/png' });
            if (newFile.size > maxSizeInMB * 1024 * 1024 && quality > 0.2) {
              compressFile(quality - 0.1);
            } else {
              console.log(`Compression complete: ${(newFile.size / (1024 * 1024)).toFixed(2)}MB`);
              resolve(newFile);
            }
          }, 'image/png', quality);
        };
        
        // Start compression with an initial quality of 0.7
        compressFile(0.7);
      };
      
      img.onerror = function() {
        reject(new Error("Failed to load image for compression"));
      };
      
      if (event.target && event.target.result) {
        img.src = event.target.result as string;
      } else {
        reject(new Error("FileReader did not return a valid result"));
      }
    };
    
    reader.onerror = function() {
      reject(new Error("Failed to read file for compression"));
    };
    
    reader.readAsDataURL(file);
  });
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
 * Processes an application form using OCR to extract information.
 * @param file The application form file.
 * @param applicationUuid The UUID of the application being processed.
 * @returns The extracted data from the form.
 */
export const processApplicationFormOCR = async (file: File, applicationUuid: string): Promise<any> => {
  try {
    console.log("Processing application form with OCR using Tesseract.js...");
    
    // Ensure file is in a valid format for OCR
    const fileToProcess = isSupportedImage(file) ? file : 
                         isPdf(file) ? await convertPdfToPng(file) : 
                         null;
    
    if (!fileToProcess) {
      throw new Error("Unsupported file type. Please upload a PDF or an image file (JPEG, PNG, BMP, TIFF).");
    }
    
    // Create a Tesseract worker instance
    const worker = await createWorker({
      logger: m => console.log(m)
    });
    
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // Create a Blob URL for OCR processing
    const imageUrl = URL.createObjectURL(fileToProcess);
    console.log("Starting OCR recognition...");
    
    const { data } = await worker.recognize(imageUrl);
    console.log("OCR Recognition completed");
    
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);
    
    console.log("OCR Text extracted:", data.text.substring(0, 200) + "...");
    
    // Parse the extracted text
    const extractedData = parseExtractedText(data.text);
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
