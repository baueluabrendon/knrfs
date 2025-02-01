export type EmployerType = 'public' | 'statutory' | 'company' | null;

export interface DocumentUploadType {
  name: string;
  file: File | null;
  required: boolean;
  employerTypes: EmployerType[];
}

export interface LoanApplicationContextType {
  currentStep: number;
  selectedEmployerType: EmployerType;
  documents: Record<string, DocumentUploadType>;
  handleEmployerTypeSelect: (type: EmployerType) => void;
  handleFileUpload: (documentKey: string, file: File) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleExit: () => void;
  handleSubmit: (e: React.FormEvent) => void;
}