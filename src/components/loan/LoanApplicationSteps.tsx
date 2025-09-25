
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentUpload } from "./sections/DocumentUpload";
import { StepIndicator } from "./sections/StepIndicator";
import { NavigationButtons } from "./sections/NavigationButtons";
import { useLoanApplication, LoanApplicationProvider } from "@/contexts/loan-application";
import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

// This component is used inside the provider
const LoanApplicationContent = () => {
  const { currentStep } = useLoanApplication();
  const [refinanceContext, setRefinanceContext] = useState<any>(null);

  useEffect(() => {
    // Check for refinance context from sessionStorage
    const storedContext = sessionStorage.getItem('refinanceContext');
    if (storedContext) {
      try {
        const context = JSON.parse(storedContext);
        if (context.type === 'refinance') {
          setRefinanceContext(context);
        }
      } catch (error) {
        console.error('Error parsing refinance context:', error);
      }
    }
  }, []);

  const isRefinanceApplication = refinanceContext?.type === 'refinance';

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to K&R Financial Services
          </h1>
          {isRefinanceApplication && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Refinance Application
            </Badge>
          )}
        </div>
        {isRefinanceApplication && refinanceContext && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Refinancing Loan:</strong> {refinanceContext.originalLoanId} • 
              <strong> Outstanding Balance:</strong> K{refinanceContext.outstandingBalance?.toLocaleString()} • 
              <strong> Completion:</strong> {refinanceContext.completionPercentage?.toFixed(1)}%
            </p>
          </div>
        )}
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
