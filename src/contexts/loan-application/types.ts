
import { EmployerType, FormDataType, DocumentUploadType } from "@/types/loan";

export interface LoanApplicationContextType {
  currentStep: number;
  selectedEmployerType: EmployerType;
  documents: Record<string, DocumentUploadType>;
  formData: FormDataType;
  isProcessingOCR: boolean;
  uploadingDocument: boolean;
  applicationUuid: string;
  ocrError: string | null;
  setCurrentStep: (step: number) => void;
  handleEmployerTypeSelect: (type: EmployerType) => void;
  handleFileUpload: (documentKey: string, file: File) => Promise<void>;
  handleNext: () => void;
  handlePrevious: () => void;
  handleExit: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  processApplicationForm: () => Promise<void>;
  updateFormData: (section: keyof FormDataType, data: any) => void;
}
