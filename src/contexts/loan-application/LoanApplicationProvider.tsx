
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { LoanApplicationContextType } from "@/types/loan.ts";
import { useApplicationSteps } from "./hooks/useApplicationSteps";
import { useDocumentUploader } from "./hooks/useDocumentUploader";
import { useFormData } from "./hooks/useFormData";
import { useEmployerTypeSelection } from "./hooks/useEmployerTypeSelection";
import { useOcrProcessor } from "./ocr-processor";

const LoanApplicationContext = createContext<LoanApplicationContextType | undefined>(undefined);

export const LoanApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applicationUuid, setApplicationUuid] = useState<string>("");
  
  // Initialize application UUID on mount
  useEffect(() => {
    setApplicationUuid(crypto.randomUUID());
  }, []);

  // Use custom hooks to manage different aspects of the application
  const { 
    currentStep, 
    setCurrentStep, 
    handleNext, 
    handlePrevious, 
    handleExit 
  } = useApplicationSteps();
  
  const { 
    documents, 
    uploadingDocument, 
    handleFileUpload 
  } = useDocumentUploader(applicationUuid);
  
  const { 
    selectedEmployerType, 
    handleEmployerTypeSelect 
  } = useEmployerTypeSelection();
  
  const { 
    formData, 
    updateFormData, 
    updateExtractedData, 
    handleSubmit 
  } = useFormData(applicationUuid);
  
  // Using OpenAI-based OCR processor
  const { 
    isProcessingOCR, 
    processApplicationForm: processOcr 
  } = useOcrProcessor(documents);

  // Process application form using OpenAI OCR
  const processApplicationForm = async (): Promise<void> => {
    try {
      toast.info("Processing document with AI OCR... This may take a minute", {
        duration: 8000,
      });
      const extractedData = await processOcr();
      if (extractedData) {
        updateExtractedData(extractedData);
        toast.success('Application form processed successfully');
      }
    } catch (error) {
      console.error("Error in processApplicationForm:", error);
      // Error is already toasted in useOcrProcessor
    }
  };

  return (
    <LoanApplicationContext.Provider
      value={{
        currentStep,
        selectedEmployerType,
        documents,
        formData,
        isProcessingOCR,
        uploadingDocument,
        applicationUuid,
        setCurrentStep,
        handleEmployerTypeSelect,
        handleFileUpload,
        handleNext,
        handlePrevious,
        handleExit,
        handleSubmit,
        processApplicationForm,
        updateFormData,
        updateExtractedData,
      }}
    >
      {children}
    </LoanApplicationContext.Provider>
  );
};

export const useLoanApplication = () => {
  const context = useContext(LoanApplicationContext);
  if (context === undefined) {
    throw new Error('useLoanApplication must be used within a LoanApplicationProvider');
  }
  return context;
};
