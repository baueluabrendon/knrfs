
import { useLoanApplication } from "@/contexts/loan-application";
import { DocumentList } from "./document-upload/DocumentList";
import { EmployerTypeSelector } from "./document-upload/EmployerTypeSelector";
import { DocumentUploadType } from "@/types/loan";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const DocumentUpload = () => {
  const {
    currentStep,
    selectedEmployerType,
    documents,
    handleEmployerTypeSelect,
    handleFileUpload,
    processApplicationForm,
    isProcessingOCR,
  } = useLoanApplication();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDocumentEnabled = (doc: DocumentUploadType) => {
    if (currentStep === 1) return true;
    if (!selectedEmployerType) return false;
    return doc.required || doc.employerTypes.includes(selectedEmployerType);
  };

  const handleProcessDocument = async () => {
    try {
      setIsSubmitting(true);
      if (!documents.applicationForm.file) {
        toast.error("Please upload an Application Form first");
        return;
      }
      
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
        <DocumentList
          documents={documents}
          filter={(key) => ["applicationForm", "termsAndConditions"].includes(key)}
          isDocumentEnabled={isDocumentEnabled}
          handleFileUpload={handleFileUpload}
        />
        
        {documents.applicationForm.file && documents.termsAndConditions.file && (
          <div className="mt-6">
            <Button 
              onClick={handleProcessDocument} 
              disabled={isSubmitting || isProcessingOCR}
              className="w-full"
            >
              {(isSubmitting || isProcessingOCR) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {(isSubmitting || isProcessingOCR) ? "Processing Document..." : "Process Application Form"}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Process your application form to extract information automatically.
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
        <EmployerTypeSelector
          selectedEmployerType={selectedEmployerType}
          onEmployerTypeSelect={handleEmployerTypeSelect}
        />
        <DocumentList
          documents={documents}
          filter={(key) => !["applicationForm", "termsAndConditions"].includes(key)}
          isDocumentEnabled={isDocumentEnabled}
          handleFileUpload={handleFileUpload}
        />
      </div>
    );
  }

  return null;
};
