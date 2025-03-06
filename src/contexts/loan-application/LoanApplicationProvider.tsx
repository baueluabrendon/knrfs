
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
import { uploadDocument, uploadApplicationDocument, mapDocumentKeyToEnum } from "./document-uploader";
import { supabase } from "@/integrations/supabase/client";

const LoanApplicationContext = createContext<LoanApplicationContextType | undefined>(undefined);

export const LoanApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmployerType, setSelectedEmployerType] = useState<EmployerType>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({ ...defaultFormData });
  const [documents, setDocuments] = useState<Record<string, DocumentUploadType>>({ ...defaultDocuments });
  const [applicationUuid, setApplicationUuid] = useState<string>("");
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  useEffect(() => {
    setApplicationUuid(crypto.randomUUID());
  }, []);

  const handleEmployerTypeSelect = (type: EmployerType) => {
    setSelectedEmployerType(type);
    toast.success(`Selected employer type: ${type}`);
  };

  const handleFileUpload = async (documentKey: string, file: File) => {
    setUploadingDocument(true);
    setOcrError(null);

    try {
      setDocuments(prev => ({
        ...prev,
        [documentKey]: { ...prev[documentKey], file }
      }));

      if (documentKey === 'applicationForm') {
        let documentUrl;
        try {
          documentUrl = await uploadApplicationDocument(
            file, 
            'applicationForm',
            applicationUuid
          );

          if (!documentUrl) {
            throw new Error(`Failed to upload ${documentKey}`);
          }
        } catch (uploadError) {
          console.error(`Error uploading ${documentKey}:`, uploadError);
          toast.error(`Failed to upload ${documents[documentKey].name}`);
          setUploadingDocument(false);
          return;
        }

        try {
          const { data: existingApp, error: fetchError } = await supabase
            .from('applications')
            .select('application_id')
            .eq('application_id', applicationUuid)
            .maybeSingle();

          if (fetchError) {
            console.error('Error checking existing application:', fetchError);
            throw fetchError;
          }

          if (existingApp) {
            const { error: updateError } = await supabase
              .from('applications')
              .update({
                application_document_url: documentUrl,
                status: 'pending',
                uploaded_at: new Date().toISOString()
              })
              .eq('application_id', applicationUuid);
              
            if (updateError) {
              console.error('Error updating application record:', updateError);
              throw updateError;
            }
          } else {
            const { error: insertError } = await supabase
              .from('applications')
              .insert({
                application_id: applicationUuid,
                application_document_url: documentUrl,
                uploaded_at: new Date().toISOString(),
                status: 'pending'
              });
              
            if (insertError) {
              console.error('Error creating application record:', insertError);
              throw insertError;
            }
          }

          toast.success(`${documents[documentKey].name} uploaded successfully`);
        } catch (dbError) {
          console.error('Database operation error:', dbError);
          toast.error("Failed to update database. Please try again.");
          setUploadingDocument(false);
          return;
        }
      } else {
        try {
          const documentUrl = await uploadDocument(file, documentKey);
          
          if (!documentUrl) {
            throw new Error(`Failed to upload ${documentKey}`);
          }
          
          const documentTypeEnum = mapDocumentKeyToEnum(documentKey);

          if (!documentTypeEnum) {
            throw new Error(`Unknown document type: ${documentKey}`);
          }

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
        } catch (error) {
          console.error(`Error uploading ${documentKey}:`, error);
          toast.error(`Failed to upload ${documents[documentKey].name}`);
          setUploadingDocument(false);
          return;
        }
      }
    } catch (error) {
      console.error(`Error in handleFileUpload for ${documentKey}:`, error);
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
    setOcrError(null);
    
    try {
      const extractedData = await processApplicationFormOCR(documents.applicationForm.file, applicationUuid);
      
      if (extractedData) {
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
    } catch (error) {
      console.error("Error processing application form:", error);
      
      // More user-friendly error message
      if (error.message && error.message.includes("502")) {
        setOcrError("The OCR service is currently unavailable. This could be due to server maintenance or high traffic. Please try again later or proceed to manually enter your information.");
        toast.error("OCR service unavailable. You can proceed to manually enter your information.");
      } else if (error.message && error.message.includes("timeout")) {
        setOcrError("The OCR processing timed out. Please try again or proceed to manually enter your information.");
        toast.error("OCR processing timed out. You can proceed to manually enter your information.");
      } else {
        setOcrError("Failed to process the application form. Please try again or proceed to manually enter your information.");
        toast.error("Failed to process application form. You can proceed to manually enter your information.");
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
    
    try {
      const success = await submitApplication(formData, applicationUuid);
      
      if (success) {
        toast.success("Application submitted successfully! Redirecting to home page...");
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("An unexpected error occurred. Please try again.");
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
        ocrError,
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
