import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface NavigationButtonsProps {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  onExit: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const NavigationButtons = ({
  currentStep,
  onPrevious,
  onNext,
  onExit,
  onSubmit,
}: NavigationButtonsProps) => {
  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="border-gray-200 hover:bg-gray-50"
      >
        Previous
      </Button>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onExit}
          className="border-gray-200 hover:bg-gray-50 text-gray-700"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Exit
        </Button>
        <Button
          onClick={currentStep === 3 ? onSubmit : onNext}
          className="bg-primary hover:bg-primary/90"
        >
          {currentStep === 3 ? "Submit Application" : "Next"}
        </Button>
      </div>
    </div>
  );
};