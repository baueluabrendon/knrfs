import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Briefcase, LandmarkIcon, Lock, Upload, XCircle } from "lucide-react";
import { PersonalInfo } from "./sections/PersonalInfo";
import { EmploymentInfo } from "./sections/EmploymentInfo";
import { ResidentialInfo } from "./sections/ResidentialInfo";
import { FinancialInfo } from "./sections/FinancialInfo";
import { LoanDetails } from "./sections/LoanDetails";

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
    // Stage 2 mandatory documents
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

  const isDocumentEnabled = (doc: DocumentUpload) => {
    if (!selectedEmployerType) return false;
    return doc.required || doc.employerTypes.includes(selectedEmployerType);
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleExit = () => {
    // Navigate back to the dashboard or previous page
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
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map(step => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === currentStep
                  ? "bg-primary text-white"
                  : step < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      <Card className="p-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Initial Documents</h2>
            <div className="grid gap-4">
              {Object.entries(documents)
                .filter(([key]) => ["applicationForm", "termsAndConditions"].includes(key))
                .map(([key, doc]) => (
                  <div key={key} className="space-y-2">
                    <Label>{doc.name}</Label>
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(key, file);
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Required Documents</h2>
            
            <div className="flex gap-4 mb-6">
              <Button
                onClick={() => handleEmployerTypeSelect('public')}
                variant={selectedEmployerType === 'public' ? 'default' : 'outline'}
                className="flex-1"
              >
                <LandmarkIcon className="mr-2 h-4 w-4" />
                Public Service
              </Button>
              <Button
                onClick={() => handleEmployerTypeSelect('statutory')}
                variant={selectedEmployerType === 'statutory' ? 'default' : 'outline'}
                className="flex-1"
              >
                <Building2 className="mr-2 h-4 w-4" />
                Statutory Body
              </Button>
              <Button
                onClick={() => handleEmployerTypeSelect('company')}
                variant={selectedEmployerType === 'company' ? 'default' : 'outline'}
                className="flex-1"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Company
              </Button>
            </div>

            <div className="grid gap-4">
              {Object.entries(documents)
                .filter(([key]) => !["applicationForm", "termsAndConditions"].includes(key))
                .map(([key, doc]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>{doc.name}</Label>
                      {doc.required && <span className="text-red-500">*</span>}
                      {!isDocumentEnabled(doc) && <Lock className="h-4 w-4 text-gray-400" />}
                    </div>
                    <Input
                      type="file"
                      disabled={!isDocumentEnabled(doc)}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(key, file);
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
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

        <div className="flex justify-between mt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button
              variant="destructive"
              onClick={handleExit}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Exit
            </Button>
          </div>
          <Button
            onClick={currentStep === 3 ? handleSubmit : handleNext}
          >
            {currentStep === 3 ? "Submit Application" : "Next"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LoanApplicationSteps;