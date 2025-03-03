
import { 
  EmployerType, 
  DocumentUploadType, 
  PersonalDetailsType, 
  EmploymentDetailsType, 
  ResidentialDetailsType,
  FinancialDetailsType,
  FormDataType
} from "@/types/loan";

export interface LoanApplicationContextType {
  currentStep: number;
  selectedEmployerType: EmployerType;
  documents: Record<string, DocumentUploadType>;
  formData: FormDataType;
  isProcessingOCR: boolean;
  setCurrentStep: (step: number) => void;
  handleEmployerTypeSelect: (type: EmployerType) => void;
  handleFileUpload: (documentKey: string, file: File) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleExit: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  processApplicationForm: () => Promise<void>;
  updateFormData: (section: keyof FormDataType, data: any) => void;
}
