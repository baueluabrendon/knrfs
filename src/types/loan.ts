
export type EmployerType = 'public' | 'statutory' | 'company' | null;

export interface DocumentUploadType {
  key: string; // Add the key property to fix the type error
  name: string;
  file: File | null;
  url?: string; // Add url property for uploaded document URL
  applicationUuid?: string; // Add uuid property for document/application UUID
  required: boolean;
  employerTypes: EmployerType[];
}

export interface PersonalDetailsType {
  clientType: string;
  givenName: string;
  surname: string;
  dateOfBirth: Date;
  gender: string;
  email: string;
  mobile: string;
  village: string;
  district: string;
  province: string;
  nationality: string;
}

export interface EmploymentDetailsType {
  company: string;
  fileNumber: string;
  position: string;
  postalAddress: string;
  phone: string;
  fax: string;
  dateEmployed: Date;
  paymaster: string;
}

export interface ResidentialDetailsType {
  lot: string;
  section: string;
  suburb: string;
  streetName: string;
  maritalStatus: string;
  spouseLastName: string;
  spouseFirstName: string;
  spouseEmployerName: string;
  spouseContactDetails: string;
  branchId: string;
}

export interface LoanFundingDetailsType{
  bank: string;
  bankBranch: string;
  bsbCode: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
}

export interface FinancialDetailsType {
  loanAmount: number;
  loanPurpose: string;
  loanTerm: number;
  pvaAmount: number;
  totalRepayable: number;
  grossSalary: number;
  netSalary: number;
}

export interface FormDataType {
  personalDetails: PersonalDetailsType;
  employmentDetails: EmploymentDetailsType;
  residentialDetails: ResidentialDetailsType;
  financialDetails: FinancialDetailsType;
  loanFundingDetails: LoanFundingDetailsType;
}

export interface LoanApplicationType {
  application_id: string;
  jsonb_data: Record<string, any>;
  jsonb_loans: Record<string, any>;
  status: string;
  uploaded_at: string;
  updated_at: string;
}

export interface LoanApplicationContextType {
  currentStep: number;
  selectedEmployerType: EmployerType;
  documents: Record<string, DocumentUploadType>;
  formData: FormDataType;
  isProcessingOCR: boolean;
  uploadingDocument: boolean;
  applicationUuid: string;
  setCurrentStep: (step: number) => void;
  handleEmployerTypeSelect: (type: EmployerType) => void;
  handleFileUpload: (documentKey: string, file: File) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleExit: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  processApplicationForm: () => Promise<void>;
  updateFormData: (section: keyof FormDataType, data: any) => void;
  updateExtractedData: (extractedData: Partial<FormDataType>) => void;
}
