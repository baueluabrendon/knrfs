import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";

type EmployerType = 'public' | 'statutory' | 'company' | null;

interface DocumentUpload {
  name: string;
  file: File | null;
  required: boolean;
  employerTypes: EmployerType[];
}

interface LoanApplicationContextType {
  currentStep: number;
  selectedEmployerType: EmployerType;
  documents: Record<string, DocumentUpload>;
  setCurrentStep: (step: number) => void;
  handleEmployerTypeSelect: (type: EmployerType) => void;
  handleFileUpload: (documentKey: string, file: File) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleExit: () => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const LoanApplicationContext = createContext<LoanApplicationContextType | undefined>(undefined);

export const LoanApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmployerType, setSelectedEmployerType] = useState<EmployerType>(null);
  const [documents, setDocuments] = useState<Record<string, DocumentUpload>>({
    // Stage 1 documents
    applicationForm: { 
      name: "Application Form", 
      file: null, 
      required: true,
      employerTypes: ['public', 'statutory', 'company']
    },
    termsAndConditions: { 
      name: "Terms and Conditions", 
      file: null, 
      required: true,
      employerTypes: ['public', 'statutory', 'company']
    },
    paySlip1: { 
      name: "Pay Slip 1", 
      file: null, 
      required: true,
      employerTypes: ['public', 'statutory', 'company']
    },
    paySlip2: { 
      name: "Pay Slip 2", 
      file: null, 
      required: true,
      employerTypes: ['public', 'statutory', 'company']
    },
    employmentLetter: { 
      name: "Employment Confirmation Letter", 
      file: null, 
      required: true,
      employerTypes: ['public', 'statutory', 'company']
    },
    dataEntryForm: { 
      name: "Data Entry Form", 
      file: null, 
      required: true,
      employerTypes: ['public', 'statutory', 'company']
    },
    salaryDeduction: { 
      name: "Irrevocable Salary Deduction Authority", 
      file: null, 
      required: true,
      employerTypes: ['public', 'statutory', 'company']
    },
    idDocument: { 
      name: "ID Document", 
      file: null, 
      required: true,
      employerTypes: ['public', 'statutory', 'company']
    },
    // Conditional documents
    permanentVariation: { 
      name: "Permanent Variation Advice", 
      file: null, 
      required: false,
      employerTypes: ['public']
    },
    paySlip3: { 
      name: "Pay Slip 3", 
      file: null, 
      required: false,
      employerTypes: ['company']
    },
    bankStatement: { 
      name: "3 Months Bank Statement", 
      file: null, 
      required: false,
      employerTypes: ['company']
    },
    nasfundForm: { 
      name: "Nasfund Account Form", 
      file: null, 
      required: false,
      employerTypes: ['company']
    },
    salaryDeductionConfirmation: { 
      name: "Salary Deduction Confirmation Letter", 
      file: null, 
      required: false,
      employerTypes: ['company']
    },
  });

  const handleEmployerTypeSelect = (type: EmployerType) => {
    setSelectedEmployerType(type);
    toast.success(`Selected employer type: ${type}`);
  };

  const handleFileUpload = (documentKey: string, file: File) => {
    setDocuments(prev => ({
      ...prev,
      [documentKey]: { ...prev[documentKey], file }
    }));
    toast.success(`${documents[documentKey].name} uploaded successfully`);
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleExit = () => {
    window.history.back();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Application submitted successfully");
  };

  return (
    <LoanApplicationContext.Provider
      value={{
        currentStep,
        selectedEmployerType,
        documents,
        setCurrentStep,
        handleEmployerTypeSelect,
        handleFileUpload,
        handleNext,
        handlePrevious,
        handleExit,
        handleSubmit,
      }}
    >
      {children}
    </LoanApplicationContext.Provider>
  );
};

export const useLoanApplication = () => {
  const context = useContext(LoanApplicationContext);
  if (context === undefined) {
    throw new Error('useLoanApplication must be used within a LoanApplicationProvider');
  }
  return context;
};
