
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

      if (documentKey === 'applicationForm' || documentKey === 'termsAndConditions') {
        console.log(`Uploading ${documentKey} to storage...`);
        
        // First, ensure the application record exists in the database
        // This ensures a record exists before trying to process the document
        console.log(`Creating/verifying application record: ${applicationUuid}`);
        const { data: existingApp, error: checkError } = await supabase
          .from('applications')
          .select('application_id')
          .eq('application_id', applicationUuid)
          .maybeSingle();
          
        if (checkError) {
          console.error('Error checking for existing application:', checkError);
          // Continue anyway, as we'll create the record if it doesn't exist
        }
        
        if (!existingApp) {
          // Create a placeholder record before uploading document
          const { error: insertError } = await supabase
            .from('applications')
            .insert({
              application_id: applicationUuid,
              status: 'pending',
              uploaded_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('Error creating application placeholder:', insertError);
            throw insertError;
          }
          
          console.log('Created application placeholder record');
          
          // Give DB time to complete transaction
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Now upload the document
        const documentUrl = await uploadApplicationDocument(
          file, 
          documentKey as 'applicationForm' | 'termsAndConditions',
          applicationUuid
        );

        if (!documentUrl) {
          throw new Error(`Failed to upload ${documentKey}`);
        }

        console.log(`Successfully uploaded ${documentKey} to: ${documentUrl}`);
        
        // Update the application record with the document URL
        const updateResult = await supabase
          .from('applications')
          .update({
            application_document_url: documentUrl,
            uploaded_at: new Date().toISOString()
          })
          .eq('application_id', applicationUuid);
            
        if (updateResult.error) {
          console.error('Error updating application record:', updateResult.error);
          throw updateResult.error;
        }
        
        console.log('Updated application record with document URL');

        // Delay to allow the database to update (increased from 3000 to 5000)
        await new Promise(resolve => setTimeout(resolve, 5000));
        
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
    
    setIsProcessingOCR(true);
    
    try {
      console.log("Starting OCR processing of application form...");
      console.log("Using application ID:", applicationUuid);
      
      // Double check that the application record exists before processing
      const { data: appCheck, error: appCheckError } = await supabase
        .from('applications')
        .select('application_id, application_document_url')
        .eq('application_id', applicationUuid)
        .maybeSingle();
        
      if (appCheckError) {
        console.error("Error checking application record:", appCheckError);
      }
      
      if (!appCheck) {
        console.log("Application record not found in database, creating placeholder...");
        // Create a placeholder record if it doesn't exist
        const { error: createError } = await supabase
          .from('applications')
          .insert({
            application_id: applicationUuid,
            status: 'pending',
            uploaded_at: new Date().toISOString()
          });
          
        if (createError) {
          console.error("Error creating placeholder record:", createError);
          throw new Error("Failed to create application record");
        }
        
        // Wait for DB transaction to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log("Application record found:", appCheck);
      }
      
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
