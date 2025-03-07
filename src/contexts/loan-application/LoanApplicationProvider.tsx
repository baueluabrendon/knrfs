
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  EmployerType, 
  DocumentUploadType, 
  FormDataType
} from "@/types/loan";
import { LoanApplicationContextType } from "./types";
import { defaultFormData, defaultDocuments } from "./default-values";
import { processApplicationFormOCR, isPdf, isSupportedImage } from "./ocr-processor";
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
      // Validate file type
      if (documentKey === 'applicationForm' || documentKey === 'termsAndConditions') {
        if (!isPdf(file) && !isSupportedImage(file)) {
          toast.error("Unsupported file type. Please upload a PDF or an image file (JPEG, PNG, BMP, TIFF).");
          setUploadingDocument(false);
          return;
        }
      }
      
      // Update state with the uploaded file
      setDocuments(prev => ({
        ...prev,
        [documentKey]: { ...prev[documentKey], file }
      }));

      if (documentKey === 'applicationForm') {
        // Upload file, converting PDF to PNG if necessary (handled by uploadApplicationDocument)
        const documentUrl = await uploadApplicationDocument(
          file, 
          'applicationForm',
          applicationUuid
        );

        if (!documentUrl) {
          throw new Error(`Failed to upload ${documentKey}`);
        }

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
      } else {
        // For other documents
        const documentUrl = await uploadDocument(file, documentKey);
        const documentTypeEnum = mapDocumentKeyToEnum(documentKey);

        if (!documentTypeEnum) {
          throw new Error(`Unknown document type: ${documentKey}`);
        }

        if (documentUrl) {
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
    
    // Validate file type
    const fileType = documents.applicationForm.file.type;
    const supportedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
    
    if (!supportedTypes.includes(fileType)) {
      toast.error("Unsupported file type. Please upload a PDF or an image file (JPEG, PNG, BMP, TIFF).");
      return;
    }
    
    setIsProcessingOCR(true);
    
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
      toast.error("Failed to process application form");
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
