
import { Card } from "@/components/ui/card";
import { DocumentUpload } from "./sections/DocumentUpload";
import { PersonalInfo } from "./sections/PersonalInfo";
import { EmploymentInfo } from "./sections/EmploymentInfo";
import { ResidentialInfo } from "./sections/ResidentialInfo";
import { FinancialInfo } from "./sections/FinancialInfo";
import { LoanDetails } from "./sections/LoanDetails";
import { StepIndicator } from "./sections/StepIndicator";
import { NavigationButtons } from "./sections/NavigationButtons";
import { useLoanApplication, LoanApplicationProvider } from "@/contexts/loan-application";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

// This component is used inside the provider
const ApplicationForm = () => {
  const { handleSubmit, formData, updateFormData } = useLoanApplication();
  const form = useForm();
  
  // Pre-fill form with OCR data when available
  useEffect(() => {
    if (formData) {
      console.log("Pre-filling form with extracted data:", formData);
      
      // Pre-fill the form fields using useForm's setValue method
      if (formData.personalDetails) {
        Object.entries(formData.personalDetails).forEach(([key, value]) => {
          if (value) {
            form.setValue(`personalDetails.${key}`, value);
            console.log(`Setting personalDetails.${key} to`, value);
          }
        });
      }
      
      if (formData.employmentDetails) {
        Object.entries(formData.employmentDetails).forEach(([key, value]) => {
          if (value) {
            form.setValue(`employmentDetails.${key}`, value);
            console.log(`Setting employmentDetails.${key} to`, value);
          }
        });
      }
      
      if (formData.residentialDetails) {
        Object.entries(formData.residentialDetails).forEach(([key, value]) => {
          if (value) {
            form.setValue(`residentialDetails.${key}`, value);
            console.log(`Setting residentialDetails.${key} to`, value);
          }
        });
      }
      
      if (formData.financialDetails) {
        Object.entries(formData.financialDetails).forEach(([key, value]) => {
          if (value) {
            form.setValue(`financialDetails.${key}`, value);
            console.log(`Setting financialDetails.${key} to`, value);
          }
        });
      }
    }
  }, [formData, form]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Application Details</h2>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonalInfo />
          <EmploymentInfo />
          <ResidentialInfo />
          <FinancialInfo />
          <LoanDetails />
        </form>
      </Form>
    </div>
  );
};

// This component must be used inside the provider
const LoanApplicationContent = () => {
  const { currentStep } = useLoanApplication();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to K&R Financial Services</h1>
        <StepIndicator currentStep={currentStep} totalSteps={3} />
      </div>

      <Card className="p-6">
        {(currentStep === 1 || currentStep === 2) && <DocumentUpload />}
        {currentStep === 3 && <ApplicationForm />}
        <NavigationButtons />
      </Card>
    </div>
  );
};

// Main component with the provider correctly wrapping the content
const LoanApplicationSteps = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <LoanApplicationProvider>
        <LoanApplicationContent />
      </LoanApplicationProvider>
    </div>
  );
};

export default LoanApplicationSteps;
