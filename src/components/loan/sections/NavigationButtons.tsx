
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useLoanApplication } from "@/contexts/loan-application";

export const NavigationButtons = () => {
  const { currentStep, handlePrevious, handleNext, handleExit, handleSubmit } = useLoanApplication();

  return (
    <div className="flex justify-between mt-6">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={currentStep === 1}
        className="border-gray-200 hover:bg-gray-50"
      >
        Previous
      </Button>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleExit}
          className="border-gray-200 hover:bg-gray-50 text-gray-700"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Exit
        </Button>
        <Button
          onClick={currentStep === 2 ? handleSubmit : handleNext}
          className="bg-primary hover:bg-primary/90"
        >
          {currentStep === 2 ? "Submit Application" : "Next"}
        </Button>
      </div>
    </div>
  );
};
