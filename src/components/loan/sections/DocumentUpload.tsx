
import { useLoanApplication } from "@/contexts/loan-application";
import { DocumentList } from "./document-upload/DocumentList";
import { EmployerTypeSelector } from "./document-upload/EmployerTypeSelector";
import { DocumentUploadType } from "@/types/loan";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { isPdf, isSupportedImage } from "@/contexts/loan-application/ocr-processor";

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
  } = useLoanApplication();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDocumentEnabled = (doc: DocumentUploadType) => {
    if (currentStep === 1) {
      // Only enable applicationForm in step 1
      return doc.key === "applicationForm";
    }
    
    if (currentStep === 2) {
      // In step 2, enable termsAndConditions and employer-dependent docs
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
      if (!documents.applicationForm.file) {
        toast.error("Please upload an Application Form first");
        return;
      }
      
      if (!validateFileType(documents.applicationForm.file)) {
        return;
      }
      
      toast.info("Processing document... This may take a few moments", {
        duration: 3000,
      });
      
      await processApplicationForm();
      toast.success("Application form processed successfully");
    } catch (error) {
      console.error("Error processing document:", error);
      toast.error("Failed to process document. Please try again.");
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
            if (validateFileType(file)) {
              handleFileUpload(documentKey, file);
            }
          }}
          isUploading={uploadingDocument}
        />
        
        {documents.applicationForm.file && (
          <div className="mt-6">
            <Button 
              onClick={handleProcessDocument} 
              disabled={isSubmitting || isProcessingOCR}
              className="w-full"
            >
              {(isSubmitting || isProcessingOCR) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {(isSubmitting || isProcessingOCR) 
                ? "Processing Document... (Cloud-based OCR)" 
                : "Process Application Form"}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Process your application form to extract information automatically using cloud-based OCR.
            </p>
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
        
        {/* Show Terms and Conditions document first */}
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
