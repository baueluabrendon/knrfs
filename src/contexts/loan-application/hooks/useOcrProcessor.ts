
import { useState } from "react";
import { toast } from "sonner";
import { DocumentUploadType } from "@/types/loan";
import { processApplicationFormOCR } from "../ocr-processor";

export function useOcrProcessor(
  documents: Record<string, DocumentUploadType>, 
  applicationUuid: string
) {
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  const processApplicationForm = async (): Promise<any> => {
    if (!documents.applicationForm?.file) {
      toast.error("No application form uploaded");
      return null;
    }
    
    setIsProcessingOCR(true);
    
    try {
      console.log("Starting OCR processing of application form...");
      const extractedData = await processApplicationFormOCR(documents.applicationForm.file, applicationUuid);
      
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
