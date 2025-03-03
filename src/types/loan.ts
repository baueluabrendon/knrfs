
export type EmployerType = 'public' | 'statutory' | 'company' | null;

export interface DocumentUploadType {
  name: string;
  file: File | null;
  required: boolean;
  employerTypes: EmployerType[];
}

export interface PersonalDetailsType {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  idType: string;
  idNumber: string;
}

export interface EmploymentDetailsType {
  employerName: string;
  employmentDate: string;
  occupation: string;
  salary: string;
  payDay: string;
}

export interface ResidentialDetailsType {
  address: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  residentialStatus: string;
  yearsAtAddress: string;
}

export interface FinancialDetailsType {
  monthlyIncome: string;
  otherIncome: string;
  totalExpenses: string;
  loanAmount: string;
  loanPurpose: string;
  loanTerm: string;
  interestRate: string;
  interest: string;
  loanRiskInsurance: string;
  documentationFee: string;
  fortnightlyInstallment: string;
  grossLoan: string;
}

export interface FormDataType {
  personalDetails: PersonalDetailsType;
  employmentDetails: EmploymentDetailsType;
  residentialDetails: ResidentialDetailsType;
  financialDetails: FinancialDetailsType;
}

export interface LoanApplicationType {
  id: number;
  borrower_id: string;
  application_data: FormDataType;
  amount_requested: number;
  status: string;
  created_at: string;
  updated_at: string;
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
  formData?: FormDataType;
  isProcessingOCR?: boolean;
  processApplicationForm?: () => Promise<void>;
  updateFormData?: (section: keyof FormDataType, data: any) => void;
}
