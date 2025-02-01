import { useLoanApplication } from "@/contexts/LoanApplicationContext";
import { DocumentList } from "./document-upload/DocumentList";
import { EmployerTypeSelector } from "./document-upload/EmployerTypeSelector";
import { DocumentUploadType } from "@/types/loan";

export const DocumentUpload = () => {
  const {
    currentStep,
    selectedEmployerType,
    documents,
    handleEmployerTypeSelect,
    handleFileUpload,
  } = useLoanApplication();

  const isDocumentEnabled = (doc: DocumentUploadType) => {
    if (currentStep === 1) return true;
    if (!selectedEmployerType) return false;
    return doc.required || doc.employerTypes.includes(selectedEmployerType);
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