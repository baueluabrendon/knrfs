
import React, { createContext, useContext, useState, useEffect } from "react";
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
import { uploadDocument, uploadApplicationDocument } from "./document-uploader";
import { supabase } from "@/integrations/supabase/client";

// Create the context
const LoanApplicationContext = createContext<LoanApplicationContextType | undefined>(undefined);

export const LoanApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmployerType, setSelectedEmployerType] = useState<EmployerType>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({ ...defaultFormData });
  const [documents, setDocuments] = useState<Record<string, DocumentUploadType>>({ ...defaultDocuments });
  const [applicationUuid, setApplicationUuid] = useState<string>("");
  const [uploadingDocument, setUploadingDocument] = useState(false);

  // Generate a unique application UUID when the component mounts
  useEffect(() => {
    setApplicationUuid(crypto.randomUUID());
  }, []);

  const handleEmployerTypeSelect = (type: EmployerType) => {
    setSelectedEmployerType(type);
    toast.success(`Selected employer type: ${type}`);
  };

  // Helper function to map documentKey to proper enum value
  const mapDocumentKeyToEnum = (documentKey: string) => {
    const documentTypeMap: Record<string, string> = {
      'termsAndConditions': 'Terms and Conditions',
      'paySlip1': 'Pay Slip 1',
      'paySlip2': 'Pay Slip 2',
      'paySlip3': 'Pay Slip 3',
      'bankStatement': '3 Months Bank Statement',
      'idDocument': 'ID Document',
      'salaryDeduction': 'Irrevocable Salary Deduction Authority',
      'employmentLetter': 'Employment Confirmation Letter',
      'dataEntryForm': 'Data Entry Form',
      'permanentVariation': 'Permanent Variation Advice',
      'nasfundForm': 'Nasfund Account Statement',
      'salaryDeductionConfirmation': 'Salary Deduction Confirmation Letter'
    };
    
    return documentTypeMap[documentKey] || null;
  };

  const handleFileUpload = async (documentKey: string, file: File) => {
    setUploadingDocument(true);
    
    try {
      // Update documents state immediately for UI feedback
      setDocuments(prev => ({
        ...prev,
        [documentKey]: { ...prev[documentKey], file }
      }));
      
      // Special handling for application form and terms & conditions
      if (documentKey === 'applicationForm' || documentKey === 'termsAndConditions') {
        // Create application record if it doesn't exist yet
        const { data: existingApp, error: fetchError } = await supabase
          .from('applications')
          .select('application_id')
          .eq('application_id', applicationUuid)
          .maybeSingle();
        
        if (fetchError) {
          console.error('Error checking existing application:', fetchError);
          throw fetchError;
        }
        
        if (!existingApp) {
          // Create initial application record
          const { error: insertError } = await supabase
            .from('applications')
            .insert({
              application_id: applicationUuid,
              uploaded_at: new Date().toISOString(),
              status: 'pending'
            });
          
          if (insertError) {
            console.error('Error creating application record:', insertError);
            throw insertError;
          }
        }
        
        // Upload document directly to applications table
        const success = await uploadApplicationDocument(
          file, 
          documentKey as 'applicationForm' | 'termsAndConditions',
          applicationUuid
        );
        
        if (success) {
          toast.success(`${documents[documentKey].name} uploaded successfully`);
        } else {
          throw new Error(`Failed to upload ${documentKey}`);
        }
      } else {
        // For all other documents, upload to Supabase storage and record in documents table
        const documentUrl = await uploadDocument(file, documentKey);
        
        // Get the proper enum value for the document type
        const documentTypeEnum = mapDocumentKeyToEnum(documentKey);
        
        if (!documentTypeEnum) {
          throw new Error(`Unknown document type: ${documentKey}`);
        }
        
        if (documentUrl) {
          // Save document reference to the documents table
          const { error } = await supabase
            .from('documents')
            .insert({
              application_uuid: applicationUuid,
              document_type: documentTypeEnum,
              document_path: documentUrl,
              uploaded_at: new Date().toISOString()
            });
          
          if (error) {
            console.error('Error saving document reference:', error);
            throw error;
          }
          
          toast.success(`${documents[documentKey].name} uploaded successfully`);
        } else {
          throw new Error(`Failed to upload ${documentKey}`);
        }
      }
    } catch (error) {
      console.error(`Error uploading ${documentKey}:`, error);
      toast.error(`Failed to upload ${documents[documentKey].name}`);
    } finally {
      setUploadingDocument(false);
    }
  };

  const processApplicationForm = async (): Promise<void> => {
    if (!documents.applicationForm.file) {
      toast.error("No application form uploaded");
      return;
    }
    
    setIsProcessingOCR(true);
    
    try {
      const extractedData = await processApplicationFormOCR(documents.applicationForm.file, applicationUuid);
      
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
    
    // Submit the final application data
    const success = await submitApplication(formData, applicationUuid);
    
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
