import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DocumentUpload {
  name: string;
  file: File | null;
}

const LoanApplicationSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<Record<string, DocumentUpload>>({
    applicationForm: { name: "Application Form", file: null },
    termsAndConditions: { name: "Terms and Conditions Form", file: null },
    paySlip1: { name: "Pay Slip 1", file: null },
    paySlip2: { name: "Pay Slip 2", file: null },
    employmentLetter: { name: "Employment Confirmation Letter", file: null },
    salaryDeduction: { name: "Irrevocable Salary Deduction Authority", file: null },
    bankStatement: { name: "3 Months Bank Statement", file: null },
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
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
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Required Documents</h2>
            <div className="grid gap-4">
              {Object.entries(documents)
                .filter(([key]) => !["applicationForm", "termsAndConditions"].includes(key))
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

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Application Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Given Name</Label>
                  <Input required />
                </div>
                <div className="space-y-2">
                  <Label>Surname</Label>
                  <Input required />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Input required />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input type="tel" required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required />
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
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