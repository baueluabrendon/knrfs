import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  EmployerType, 
  DocumentUploadType, 
  PersonalDetailsType, 
  EmploymentDetailsType, 
  ResidentialDetailsType,
  FinancialDetailsType,
  FormDataType
} from "@/types/loan";

interface LoanApplicationContextType {
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

const defaultPersonalDetails: PersonalDetailsType = {
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

const defaultEmploymentDetails: EmploymentDetailsType = {
  employerName: "",
  employmentDate: "",
  occupation: "",
  salary: "",
  payDay: "",
};

const defaultResidentialDetails: ResidentialDetailsType = {
  address: "",
  suburb: "",
  city: "",
  province: "",
  postalCode: "",
  residentialStatus: "",
  yearsAtAddress: "",
};

const defaultFinancialDetails: FinancialDetailsType = {
  monthlyIncome: "",
  otherIncome: "",
  totalExpenses: "",
  loanAmount: "",
  loanPurpose: "",
  loanTerm: "",
  interestRate: "",
  interest: "",
  loanRiskInsurance: "",
  documentationFee: "",
  fortnightlyInstallment: "",
  grossLoan: ""
};

const LoanApplicationContext = createContext<LoanApplicationContextType | undefined>(undefined);

export const LoanApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmployerType, setSelectedEmployerType] = useState<EmployerType>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    personalDetails: { ...defaultPersonalDetails },
    employmentDetails: { ...defaultEmploymentDetails },
    residentialDetails: { ...defaultResidentialDetails },
    financialDetails: { ...defaultFinancialDetails }
  });
  
  const [documents, setDocuments] = useState<Record<string, DocumentUploadType>>({
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
      const functionUrl = `${process.env.SUPABASE_URL}/functions/v1/process-application-form`;
      const token = supabase.auth.getSession().then(({ data }) => data.session?.access_token);
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${await token}`,
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
        financialDetails: {
          monthlyIncome: result.monthlyIncome || '',
          otherIncome: result.otherIncome || '',
          totalExpenses: result.totalExpenses || '',
          loanAmount: result.loanAmount || '',
          loanPurpose: result.loanPurpose || '',
          loanTerm: result.loanTerm || '',
          interestRate: result.interestRate || '',
          interest: result.interest || '',
          loanRiskInsurance: result.loanRiskInsurance || '',
          documentationFee: result.documentationFee || '',
          fortnightlyInstallment: result.fortnightlyInstallment || '',
          grossLoan: result.grossLoan || ''
        }
      });
      
      toast.success('Application form processed successfully');
    } catch (error) {
      console.error('Error processing application form:', error);
      toast.error('Failed to process application form');
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const updateFormData = (section: keyof FormDataType, data: any) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Submit application data to Supabase
      const applicationData = {
        ...formData.personalDetails,
        ...formData.employmentDetails,
        ...formData.residentialDetails,
        ...formData.financialDetails
      };

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('Authentication required');
      }

      const { error } = await supabase
        .from('loan_applications')
        .insert({
          borrower_id: sessionData.session.user.id,
          application_data: applicationData,
          amount_requested: parseFloat(formData.financialDetails.loanAmount) || 0,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      toast.success("Application submitted successfully");
      // Redirect to the application status page
      setTimeout(() => {
        window.location.href = '/client/application-status';
      }, 2000);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error("Failed to submit application. Please try again.");
    }
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
