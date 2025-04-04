interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
        <div
          key={step}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
            step === currentStep
              ? "bg-primary text-white"
              : step < currentStep
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {step}
        </div>
      ))}
    </div>
  );
};