import { Card } from "@/components/ui/card";
import { DocumentUpload } from "./sections/DocumentUpload";
import { PersonalInfo } from "./sections/PersonalInfo";
import { EmploymentInfo } from "./sections/EmploymentInfo";
import { ResidentialInfo } from "./sections/ResidentialInfo";
import { FinancialInfo } from "./sections/FinancialInfo";
import { LoanDetails } from "./sections/LoanDetails";
import { StepIndicator } from "./sections/StepIndicator";
import { NavigationButtons } from "./sections/NavigationButtons";
import { useLoanApplication } from "@/contexts/LoanApplicationContext";

const LoanApplicationContent = () => {
  const { currentStep, handleSubmit } = useLoanApplication();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to K&R Financial Services</h1>
        <StepIndicator currentStep={currentStep} totalSteps={3} />
      </div>

      <Card className="p-6">
        {(currentStep === 1 || currentStep === 2) && <DocumentUpload />}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Application Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <PersonalInfo />
              <EmploymentInfo />
              <ResidentialInfo />
              <FinancialInfo />
              <LoanDetails />
            </form>
          </div>
        )}

        <NavigationButtons />
      </Card>
    </div>
  );
};

const LoanApplicationSteps = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <LoanApplicationContent />
    </div>
  );
};

export default LoanApplicationSteps;