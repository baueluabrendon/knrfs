import { useState } from "react";
import { useLoanApplication } from "@/contexts/loan-application";
import { DocumentList } from "./document-upload/DocumentList";
import { EmployerTypeSelector } from "./document-upload/EmployerTypeSelector";
import { DocumentUploadType } from "@/types/loan";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { isPdf, isSupportedImage } from "@/utils/storageUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PersonalInfo } from "./PersonalInfo";
import { EmploymentInfo } from "./EmploymentInfo";
import { ResidentialInfo } from "./ResidentialInfo";
import { FinancialInfo } from "./FinancialInfo";
import { LoanDetails } from "./LoanDetails";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import React from "react";

export const DocumentUpload = () => {
  const {
    currentStep,
    selectedEmployerType,
    documents,
    handleEmployerTypeSelect,
    handleFileUpload,
    processApplicationForm,
    isProcessingOCR,
    uploadingDocument,
    formData,
  } = useLoanApplication();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const form = useForm();
  
  React.useEffect(() => {
    if (formData && showReviewForm) {
      console.log("Pre-filling form with extracted data:", formData);
      
      if (formData.personalDetails) {
        Object.entries(formData.personalDetails).forEach(([key, value]) => {
          if (value) {
            form.setValue(`personalDetails.${key}`, value);
            console.log(`Setting personalDetails.${key} to`, value);
          }
        });
      }
      
      if (formData.employmentDetails) {
        Object.entries(formData.employmentDetails).forEach(([key, value]) => {
          if (value) {
            form.setValue(`employmentDetails.${key}`, value);
            console.log(`Setting employmentDetails.${key} to`, value);
          }
        });
      }
      
      if (formData.residentialDetails) {
        Object.entries(formData.residentialDetails).forEach(([key, value]) => {
          if (value) {
            form.setValue(`residentialDetails.${key}`, value);
            console.log(`Setting residentialDetails.${key} to`, value);
          }
        });
      }
      
      if (formData.financialDetails) {
        Object.entries(formData.financialDetails).forEach(([key, value]) => {
          if (value) {
            form.setValue(`financialDetails.${key}`, value);
            console.log(`Setting financialDetails.${key} to`, value);
          }
        });
      }
    }
  }, [formData, form, showReviewForm]);

  const isDocumentEnabled = (doc: DocumentUploadType) => {
    if (currentStep === 1) {
      return doc.key === "applicationForm";
    }
    
    if (currentStep === 2) {
      if (doc.key === "termsAndConditions") return true;
      if (!selectedEmployerType) return false;
      return doc.required || doc.employerTypes.includes(selectedEmployerType);
    }
    
    return false;
  };

  const validateFileType = (file: File): boolean => {
    if (!isPdf(file) && !isSupportedImage(file)) {
      toast.error("Unsupported file type. Please upload a PDF or an image file (JPEG, PNG, BMP, TIFF).");
      return false;
    }
    return true;
  };

  const handleProcessDocument = async () => {
    try {
      setIsSubmitting(true);
      setProcessingError(null);
      
      if (!documents.applicationForm.file) {
        toast.error("Please upload an Application Form first");
        return;
      }
      
      if (!validateFileType(documents.applicationForm.file)) {
        return;
      }
      
      toast.info("Processing document with OCR... This may take a minute", {
        duration: 5000,
      });
      
      await processApplicationForm();
      toast.success("Application form processed successfully. Data extracted and saved.");
      setShowReviewForm(true);
    } catch (error: any) {
      console.error("Error processing document:", error);
      const errorMessage = error.message || "Failed to process document. Please try again.";
      setProcessingError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStep === 1) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Initial Documents</h2>
        <p className="text-sm text-gray-600">
          Please upload your application form to proceed with your loan application.
        </p>
        
        <DocumentList
          documents={documents}
          filter={(key) => ["applicationForm"].includes(key)}
          isDocumentEnabled={isDocumentEnabled}
          handleFileUpload={(documentKey, file) => {
            setProcessingError(null);
            setShowReviewForm(false);
            if (validateFileType(file)) {
              handleFileUpload(documentKey, file);
            }
          }}
          isUploading={uploadingDocument}
        />
        
        {processingError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {processingError}
            </AlertDescription>
          </Alert>
        )}
        
        {documents.applicationForm.file && !showReviewForm && (
          <div className="mt-6">
            <Button 
              onClick={handleProcessDocument} 
              disabled={isSubmitting || isProcessingOCR}
              className="w-full"
            >
              {(isSubmitting || isProcessingOCR) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Document with OCR...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Extract Data from Application Form
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Your document will be processed using OCR to automatically extract application information.
              This process may take 1-2 minutes depending on the document complexity.
            </p>
          </div>
        )}
        
        {showReviewForm && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Review Extracted Information</h2>
            <p className="text-sm text-gray-600 mb-4">
              Please review the information extracted from your application. You can make corrections in the next step.
            </p>
            
            <Form {...form}>
              <form className="space-y-6">
                <PersonalInfo />
                <EmploymentInfo />
                <ResidentialInfo />
                <FinancialInfo />
                <LoanDetails />
              </form>
            </Form>
          </div>
        )}
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Required Documents</h2>
        <p className="text-sm text-gray-600">
          Please upload the terms and conditions form and select your employer type for additional required documents.
        </p>
        
        <DocumentList
          documents={documents}
          filter={(key) => ["termsAndConditions"].includes(key)}
          isDocumentEnabled={isDocumentEnabled}
          handleFileUpload={(documentKey, file) => {
            if (validateFileType(file)) {
              handleFileUpload(documentKey, file);
            }
          }}
          isUploading={uploadingDocument}
        />
        
        <EmployerTypeSelector
          selectedEmployerType={selectedEmployerType}
          onEmployerTypeSelect={handleEmployerTypeSelect}
        />
        
        <DocumentList
          documents={documents}
          filter={(key) => !["applicationForm", "termsAndConditions"].includes(key)}
          isDocumentEnabled={isDocumentEnabled}
          handleFileUpload={(documentKey, file) => {
            if (validateFileType(file)) {
              handleFileUpload(documentKey, file);
            }
          }}
          isUploading={uploadingDocument}
        />
      </div>
    );
  }

  return null;
};
