
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

  useEffect(() => {
    setApplicationUuid(crypto.randomUUID());
  }, []);

  const handleEmployerTypeSelect = (type: EmployerType) => {
    setSelectedEmployerType(type);
    toast.success(`Selected employer type: ${type}`);
  };

  const handleFileUpload = async (documentKey: string, file: File) => {
    setUploadingDocument(true);

    try {
      setDocuments(prev => ({
        ...prev,
        [documentKey]: { ...prev[documentKey], file }
      }));

      if (documentKey === 'applicationForm') {
        console.log(`Uploading ${documentKey} to storage...`);
        const documentUrl = await uploadApplicationDocument(
          file, 
          'applicationForm',
          applicationUuid
        );

        if (!documentUrl) {
          throw new Error(`Failed to upload ${documentKey}`);
        }

        console.log(`Successfully uploaded ${documentKey} to: ${documentUrl}`);
        console.log(`Checking if application record exists for ID: ${applicationUuid}`);

        const { data: existingApp, error: fetchError } = await supabase
          .from('applications')
          .select('application_id')
          .eq('application_id', applicationUuid)
          .maybeSingle();

        if (fetchError) {
          console.error('Error checking existing application:', fetchError);
          throw fetchError;
        }

        let updateResult;
        if (existingApp) {
          console.log(`Updating existing application record: ${applicationUuid}`);
          updateResult = await supabase
            .from('applications')
            .update({
              application_document_url: documentUrl,
              status: 'pending',
              uploaded_at: new Date().toISOString()
            })
            .eq('application_id', applicationUuid);
        } else {
          console.log(`Creating new application record with ID: ${applicationUuid}`);
          updateResult = await supabase
            .from('applications')
            .insert({
              application_id: applicationUuid,
              application_document_url: documentUrl,
              uploaded_at: new Date().toISOString(),
              status: 'pending'
            });
        }
            
        if (updateResult.error) {
          console.error('Error updating/creating application record:', updateResult.error);
          throw updateResult.error;
        }

        // Delay to allow the database to update
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Use maybeSingle instead of single to prevent errors when the record isn't found
        const { data: verifyApp, error: verifyError } = await supabase
          .from('applications')
          .select('application_document_url')
          .eq('application_id', applicationUuid)
          .maybeSingle();
        
        if (verifyError) {
          console.error('Error verifying application document URL:', verifyError);
        } else if (!verifyApp?.application_document_url) {
          console.warn('Application URL not yet available in DB, may need retry during processing');
        } else {
          console.log('Verified application_document_url is saved:', verifyApp.application_document_url);
        }

        toast.success(`${documents[documentKey].name} uploaded successfully`);
      } else {
        // This is a supporting document (terms and conditions, pay slip, etc.)
        // Verify document type is valid
        const documentTypeEnum = mapDocumentKeyToEnum(documentKey);

        if (!documentTypeEnum) {
          throw new Error(`Unknown document type: ${documentKey}`);
        }

        // Upload the supporting document
        const documentUrl = await uploadDocument(file, documentKey, applicationUuid);
        
        if (!documentUrl) {
          throw new Error(`Failed to upload ${documentKey}`);
        }

        console.log(`Successfully uploaded ${documentKey} to: ${documentUrl}`);
        
        // Insert record into documents table
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
      console.log("Starting OCR processing of application form...");
      const extractedData = await processApplicationFormOCR(documents.applicationForm.file, applicationUuid);
      
      if (extractedData) {
        console.log("Successfully extracted data from application form:", extractedData);
        
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
      toast.error("Failed to process application form");
      throw error; // Re-throw to allow for custom error handling in UI
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
    
    const success = await submitApplication(formData, applicationUuid);
    
    if (success) {
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
