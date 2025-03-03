
import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type EmployerType = 'public' | 'statutory' | 'company' | null;

interface DocumentUpload {
  name: string;
  file: File | null;
  required: boolean;
  employerTypes: EmployerType[];
}

interface PersonalDetails {
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

interface EmploymentDetails {
  employerName: string;
  employmentDate: string;
  occupation: string;
  salary: string;
  payDay: string;
}

interface ResidentialDetails {
  address: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  residentialStatus: string;
  yearsAtAddress: string;
}

interface FormData {
  personalDetails: PersonalDetails;
  employmentDetails: EmploymentDetails;
  residentialDetails: ResidentialDetails;
}

interface LoanApplicationContextType {
  currentStep: number;
  selectedEmployerType: EmployerType;
  documents: Record<string, DocumentUpload>;
  formData: FormData;
  isProcessingOCR: boolean;
  setCurrentStep: (step: number) => void;
  handleEmployerTypeSelect: (type: EmployerType) => void;
  handleFileUpload: (documentKey: string, file: File) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleExit: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  processApplicationForm: () => Promise<void>;
  updateFormData: (section: keyof FormData, data: any) => void;
}

const defaultPersonalDetails: PersonalDetails = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  email: "",
  phone: "",
  idType: "",
  idNumber: "",
};

const defaultEmploymentDetails: EmploymentDetails = {
  employerName: "",
  employmentDate: "",
  occupation: "",
  salary: "",
  payDay: "",
};

const defaultResidentialDetails: ResidentialDetails = {
  address: "",
  suburb: "",
  city: "",
  province: "",
  postalCode: "",
  residentialStatus: "",
  yearsAtAddress: "",
};

const LoanApplicationContext = createContext<LoanApplicationContextType | undefined>(undefined);

export const LoanApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmployerType, setSelectedEmployerType] = useState<EmployerType>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    personalDetails: { ...defaultPersonalDetails },
    employmentDetails: { ...defaultEmploymentDetails },
    residentialDetails: { ...defaultResidentialDetails },
  });
  
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

  const processApplicationForm = async (): Promise<void> => {
    if (!documents.applicationForm.file) {
      toast.error("No application form uploaded");
      return;
    }
    
    setIsProcessingOCR(true);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', documents.applicationForm.file);
      
      // Call the Supabase Edge Function for OCR processing
      const response = await fetch(`${supabase.functions.url}/process-application-form`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${supabase.auth.session()?.access_token || ''}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('OCR processing failed');
      }
      
      const result = await response.json();
      
      // Update form data with extracted information
      setFormData({
        personalDetails: {
          firstName: result.firstName || '',
          middleName: result.middleName || '',
          lastName: result.lastName || '',
          dateOfBirth: result.dateOfBirth || '',
          gender: result.gender || '',
          email: result.email || '',
          phone: result.phone || '',
          idType: result.idType || '',
          idNumber: result.idNumber || '',
        },
        employmentDetails: {
          employerName: result.employerName || '',
          employmentDate: result.employmentDate || '',
          occupation: result.occupation || '',
          salary: result.salary || '',
          payDay: result.payDay || '',
        },
        residentialDetails: {
          address: result.address || '',
          suburb: result.suburb || '',
          city: result.city || '',
          province: result.province || '',
          postalCode: result.postalCode || '',
          residentialStatus: result.residentialStatus || '',
          yearsAtAddress: result.yearsAtAddress || '',
        },
      });
      
      toast.success('Application form processed successfully');
    } catch (error) {
      console.error('Error processing application form:', error);
      toast.error('Failed to process application form');
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const updateFormData = (section: keyof FormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data
      }
    }));
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
        formData,
        isProcessingOCR,
        setCurrentStep,
        handleEmployerTypeSelect,
        handleFileUpload,
        handleNext,
        handlePrevious,
        handleExit,
        handleSubmit,
        processApplicationForm,
        updateFormData,
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
