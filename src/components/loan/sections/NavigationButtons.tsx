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
    <div className="flex justify-between mt-6">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
      >
        Previous
      </Button>
      <div className="flex gap-2">
        <Button
          variant="destructive"
          onClick={onExit}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Exit
        </Button>
        <Button
          onClick={currentStep === 3 ? onSubmit : onNext}
        >
          {currentStep === 3 ? "Submit Application" : "Next"}
        </Button>
      </div>
    </div>
  );
};