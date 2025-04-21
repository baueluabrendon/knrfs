
import { Card } from "@/components/ui/card";
import { DocumentUpload } from "./sections/DocumentUpload";
import { StepIndicator } from "./sections/StepIndicator";
import { NavigationButtons } from "./sections/NavigationButtons";
import { useLoanApplication, LoanApplicationProvider } from "@/contexts/loan-application";

// This component is used inside the provider
const LoanApplicationContent = () => {
  const { currentStep } = useLoanApplication();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to K&R Financial Services</h1>
        <StepIndicator currentStep={currentStep} totalSteps={2} />
      </div>

      <Card className="p-6">
        <DocumentUpload />
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
