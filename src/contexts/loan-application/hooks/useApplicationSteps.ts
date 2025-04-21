
import { useState } from "react";
import { toast } from "sonner";

export function useApplicationSteps() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleExit = () => {
    window.history.back();
  };

  return {
    currentStep,
    setCurrentStep,
    handleNext,
    handlePrevious,
    handleExit
  };
}
