
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

// This component shows the application details preview
const ApplicationReview = () => {
  const { formData } = useLoanApplication();
  
  if (!formData) return null;
  
  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800">Application Preview</h2>
      <p className="text-sm text-gray-600">
        Review your application information extracted from the uploaded document.
        You can edit these details in the next step if needed.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Personal Information</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {formData.personalDetails.firstName} {formData.personalDetails.lastName}</p>
            <p><span className="font-medium">Email:</span> {formData.personalDetails.email}</p>
            <p><span className="font-medium">Phone:</span> {formData.personalDetails.phone}</p>
            <p><span className="font-medium">ID Number:</span> {formData.personalDetails.idNumber}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Employment Information</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Employer:</span> {formData.employmentDetails.employerName}</p>
            <p><span className="font-medium">Position:</span> {formData.employmentDetails.position}</p>
            <p><span className="font-medium">Salary:</span> {formData.employmentDetails.salary}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Residential Information</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Address:</span> {formData.residentialDetails.address}</p>
            <p><span className="font-medium">City:</span> {formData.residentialDetails.city}</p>
            <p><span className="font-medium">Province:</span> {formData.residentialDetails.province}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Loan Details</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Amount:</span> {formData.financialDetails.loanAmount}</p>
            <p><span className="font-medium">Term:</span> {formData.financialDetails.loanTerm}</p>
            <p><span className="font-medium">Purpose:</span> {formData.financialDetails.loanPurpose}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 2 now contains the editable form
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
      <h2 className="text-xl font-semibold text-gray-800">Edit Application Details</h2>
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
        <StepIndicator currentStep={currentStep} totalSteps={2} />
      </div>

      <Card className="p-6">
        {currentStep === 1 && (
          <>
            <DocumentUpload />
            <ApplicationReview />
          </>
        )}
        {currentStep === 2 && <ApplicationForm />}
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
