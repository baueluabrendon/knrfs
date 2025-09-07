
import { 
  PersonalDetailsType, 
  EmploymentDetailsType, 
  ResidentialDetailsType,
  FinancialDetailsType,
  LoanFundingDetailsType,
  DocumentUploadType,
  FormDataType
} from "@/types/loan";

// PersonalDetailsType
export const defaultPersonalDetails: PersonalDetailsType = {
  clientType: "",
  givenName: "",
  surname: "",
  dateOfBirth: new Date(),
  gender: "",
  email: "",
  mobile: "",
  village: "",
  district: "",
  province: "",
  nationality: "",
};

// EmploymentDetailsType
export const defaultEmploymentDetails: EmploymentDetailsType = {
  company: "",
  fileNumber: "",
  position: "",
  postalAddress: "",
  phone: "",
  fax: "",
  dateEmployed: new Date(),
  paymaster: ""
};

// ResidentialDetailsType
export const defaultResidentialDetails: ResidentialDetailsType = {
  lot: "",
  section: "",
  suburb: "",
  streetName: "",
  maritalStatus: "",
  spouseLastName: "",
  spouseFirstName: "",
  spouseEmployerName: "",
  spouseContactDetails: "",
  branchId: ""
};

// LoanFundingDetailsType
export const defaultLoanFundingDetails: LoanFundingDetailsType = {
  bank: "",
  bankBranch: "",
  bsbCode: "",
  accountName: "",
  accountNumber: "",
  accountType: ""
};

// FinancialDetailsType
export const defaultFinancialDetails: FinancialDetailsType = {
  loanAmount: 0,
  loanPurpose: "",
  loanTerm: 0,
  pvaAmount: 0,
  totalRepayable: 0,
  grossSalary: 0,
  netSalary: 0
};

// FormDataType
export const defaultFormData: FormDataType = {
  personalDetails: { ...defaultPersonalDetails },
  employmentDetails: { ...defaultEmploymentDetails },
  residentialDetails: { ...defaultResidentialDetails },
  financialDetails: { ...defaultFinancialDetails },
  loanFundingDetails: { ...defaultLoanFundingDetails }
};

export const defaultDocuments: Record<string, DocumentUploadType> = {
  // Stage 1 documents
  applicationForm: { 
    key: "applicationForm",
    name: "Application Form", 
    file: null, 
    required: true,
    employerTypes: ['public', 'statutory', 'company']
  },
  // Move terms and conditions to stage 2
  termsAndConditions: { 
    key: "termsAndConditions",
    name: "Terms and Conditions", 
    file: null, 
    required: true,
    employerTypes: ['public', 'statutory', 'company']
  },
  paySlip1: { 
    key: "paySlip1",
    name: "Pay Slip 1", 
    file: null, 
    required: true,
    employerTypes: ['public', 'statutory', 'company']
  },
  paySlip2: { 
    key: "paySlip2",
    name: "Pay Slip 2", 
    file: null, 
    required: true,
    employerTypes: ['public', 'statutory', 'company']
  },
  employmentLetter: { 
    key: "employmentLetter",
    name: "Employment Confirmation Letter", 
    file: null, 
    required: true,
    employerTypes: ['public', 'statutory', 'company']
  },
  dataEntryForm: { 
    key: "dataEntryForm",
    name: "Data Entry Form", 
    file: null, 
    required: true,
    employerTypes: ['public', 'statutory', 'company']
  },
  salaryDeduction: { 
    key: "salaryDeduction",
    name: "Irrevocable Salary Deduction Authority", 
    file: null, 
    required: true,
    employerTypes: ['public', 'statutory', 'company']
  },
  idDocument: { 
    key: "idDocument",
    name: "ID Document", 
    file: null, 
    required: true,
    employerTypes: ['public', 'statutory', 'company']
  },
  // Conditional documents
  permanentVariation: { 
    key: "permanentVariation",
    name: "Permanent Variation Advice", 
    file: null, 
    required: false,
    employerTypes: ['public']
  },
  paySlip3: { 
    key: "paySlip3",
    name: "Pay Slip 3", 
    file: null, 
    required: false,
    employerTypes: ['company']
  },
  bankStatement: { 
    key: "bankStatement",
    name: "3 Months Bank Statement", 
    file: null, 
    required: false,
    employerTypes: ['company']
  },
  nasfundForm: { 
    key: "nasfundForm",
    name: "Nasfund Account Form", 
    file: null, 
    required: false,
    employerTypes: ['company']
  },
  salaryDeductionConfirmation: { 
    key: "salaryDeductionConfirmation",
    name: "Salary Deduction Confirmation Letter", 
    file: null, 
    required: false,
    employerTypes: ['company']
  },
};
