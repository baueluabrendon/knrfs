import { useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { DocumentUpload } from "./sections/DocumentUpload";
import { PersonalInfo } from "./sections/PersonalInfo";
import { EmploymentInfo } from "./sections/EmploymentInfo";
import { ResidentialInfo } from "./sections/ResidentialInfo";
import { FinancialInfo } from "./sections/FinancialInfo";
import { LoanDetails } from "./sections/LoanDetails";
import { StepIndicator } from "./sections/StepIndicator";
import { NavigationButtons } from "./sections/NavigationButtons";

type EmployerType = 'public' | 'statutory' | 'company' | null;

interface DocumentUpload {
  name: string;
  file: File | null;
  required: boolean;
  employerTypes: EmployerType[];
}

const LoanApplicationSteps = () => {
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

  const handleFileUpload = (documentKey: string, file: File) => {
    setDocuments(prev => ({
      ...prev,
      [documentKey]: { ...prev[documentKey], file }
    }));
    toast.success(`${documents[documentKey].name} uploaded successfully`);
  };

  const handleEmployerTypeSelect = (type: EmployerType) => {
    setSelectedEmployerType(type);
    toast.success(`Selected employer type: ${type}`);
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
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome to K&R Financial Services</h1>
        <StepIndicator currentStep={currentStep} totalSteps={3} />
      </div>

      <Card className="p-6">
        {(currentStep === 1 || currentStep === 2) && (
          <DocumentUpload
            currentStep={currentStep}
            selectedEmployerType={selectedEmployerType}
            documents={documents}
            onEmployerTypeSelect={handleEmployerTypeSelect}
            onFileUpload={handleFileUpload}
          />
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Application Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <PersonalInfo />
              <EmploymentInfo />
              <ResidentialInfo />
              <FinancialInfo />
              <LoanDetails />
            </form>
          </div>
        )}

        <NavigationButtons
          currentStep={currentStep}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onExit={handleExit}
          onSubmit={handleSubmit}
        />
      </Card>
    </div>
  );
};

export default LoanApplicationSteps;
