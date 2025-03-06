
import React, { useState } from "react";
import { useLoanApplication } from "@/contexts/loan-application";
import { DocumentList } from "./document-upload/DocumentList";
import { EmployerTypeSelector } from "./document-upload/EmployerTypeSelector";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmployerType } from "@/types/loan";

export const DocumentUpload = () => {
  const { 
    currentStep,
    selectedEmployerType,
    isProcessingOCR,
    documents,
    ocrError,
    handleEmployerTypeSelect,
    processApplicationForm
  } = useLoanApplication();
  
  const [showProcessButton, setShowProcessButton] = useState(false);

  // Only show the process button if application form is uploaded
  React.useEffect(() => {
    if (documents.applicationForm && documents.applicationForm.file) {
      setShowProcessButton(true);
    } else {
      setShowProcessButton(false);
    }
  }, [documents.applicationForm]);

  const handleProcessDocument = async () => {
    try {
      await processApplicationForm();
    } catch (error) {
      console.error("Error processing document:", error);
    }
  };

  if (currentStep === 1) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Employment Information</h3>
          <p className="text-sm text-gray-500">
            Please select your employment type to continue with the application.
          </p>
        </div>
        <EmployerTypeSelector 
          onSelect={handleEmployerTypeSelect}
          selectedType={selectedEmployerType}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Upload Required Documents</h3>
        <p className="text-sm text-gray-500">
          Please upload all required documents to proceed with your application.
        </p>
      </div>

      {ocrError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>OCR Processing Error</AlertTitle>
          <AlertDescription>
            {ocrError}
          </AlertDescription>
        </Alert>
      )}
      
      <DocumentList employerType={selectedEmployerType as EmployerType} />
      
      {showProcessButton && (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={handleProcessDocument}
            disabled={isProcessingOCR || !documents.applicationForm?.file}
            className="flex items-center gap-2"
          >
            {isProcessingOCR ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Process Application Form
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
