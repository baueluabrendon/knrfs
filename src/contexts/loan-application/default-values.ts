
import { 
  PersonalDetailsType, 
  EmploymentDetailsType, 
  ResidentialDetailsType,
  FinancialDetailsType,
  ApplicationDetailsType,
  DocumentUploadType,
  FormDataType
} from "@/types/loan";

export const defaultPersonalDetails: PersonalDetailsType = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  email: "",
  phone: "",
  idType: "",
  idNumber: "",
  nationality: "",
  maritalStatus: "",
  spouseFirstName: "",
  spouseLastName: "",
  spouseEmployerName: "",
  spouseContactDetails: ""
};

export const defaultEmploymentDetails: EmploymentDetailsType = {
  employerName: "",
  employmentDate: "",
  occupation: "",
  salary: "",
  payDay: "",
  fileNumber: "",
  position: "",
  postalAddress: "",
  workPhoneNumber: "",
  fax: "",
  paymaster: ""
};

export const defaultResidentialDetails: ResidentialDetailsType = {
  address: "",
  suburb: "",
  city: "",
  province: "",
  postalCode: "",
  residentialStatus: "",
  yearsAtAddress: "",
  lot: "",
  section: "",
  streetName: "",
  village: "",
  district: ""
};

export const defaultFinancialDetails: FinancialDetailsType = {
  monthlyIncome: "",
  otherIncome: "",
  totalExpenses: "",
  loanAmount: "",
  loanPurpose: "",
  loanTerm: "",
  interestRate: "",
  loanRiskInsurance: "",
  documentationFee: "",
  fortnightlyInstallment: "",
  grossLoan: "",
  bank: "",
  bankBranch: "",
  bsbCode: "",
  accountName: "",
  accountNumber: "",
  accountType: ""
};

export const defaultApplicationDetails = {
  branchId: "",
  applicationDate: new Date().toISOString().split('T')[0]
};

export const defaultFormData: FormDataType = {
  personalDetails: { ...defaultPersonalDetails },
  employmentDetails: { ...defaultEmploymentDetails },
  residentialDetails: { ...defaultResidentialDetails },
  financialDetails: { ...defaultFinancialDetails },
  applicationDetails: { ...defaultApplicationDetails }
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
