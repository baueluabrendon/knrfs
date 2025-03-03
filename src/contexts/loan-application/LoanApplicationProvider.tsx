
import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { 
  EmployerType, 
  DocumentUploadType, 
  FormDataType
} from "@/types/loan";
import { LoanApplicationContextType } from "./types";
import { defaultFormData, defaultDocuments } from "./default-values";
import { processApplicationFormOCR } from "./ocr-processor";
import { submitApplication } from "./submit-application";

// Create the context
const LoanApplicationContext = createContext<LoanApplicationContextType | undefined>(undefined);

export const LoanApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmployerType, setSelectedEmployerType] = useState<EmployerType>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({ ...defaultFormData });
  const [documents, setDocuments] = useState<Record<string, DocumentUploadType>>({ ...defaultDocuments });

  const handleEmployerTypeSelect = (type: EmployerType) => {
    setSelectedEmployerType(type);
    toast.success(`Selected employer type: ${type}`);
  };

  const handleFileUpload = (documentKey: string, file: File) => {
    setDocuments(prev => ({
      ...prev,
      [documentKey]: { ...prev[documentKey], file }
    }));
    toast.success(`${documents[documentKey].name} uploaded successfully`);
  };

  const processApplicationForm = async (): Promise<void> => {
    if (!documents.applicationForm.file) {
      toast.error("No application form uploaded");
      return;
    }
    
    setIsProcessingOCR(true);
    
    try {
      const extractedData = await processApplicationFormOCR(documents.applicationForm.file);
      
      if (extractedData) {
        // Update form data with extracted information
        setFormData(prevData => ({
          personalDetails: {
            ...prevData.personalDetails,
            ...extractedData.personalDetails
          },
          employmentDetails: {
            ...prevData.employmentDetails,
            ...extractedData.employmentDetails
          },
          residentialDetails: {
            ...prevData.residentialDetails,
            ...extractedData.residentialDetails
          },
          financialDetails: {
            ...prevData.financialDetails,
            ...extractedData.financialDetails
          }
        }));
        
        toast.success('Application form processed successfully');
      }
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const updateFormData = (section: keyof FormDataType, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data
      }
    }));
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleExit = () => {
    window.history.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await submitApplication(formData);
    
    if (success) {
      // Redirect to a thank you or confirmation page
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
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
        setCurrentStep,
        handleEmployerTypeSelect,
        handleFileUpload,
        handleNext,
        handlePrevious,
        handleExit,
        handleSubmit,
        processApplicationForm,
        updateFormData,
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
