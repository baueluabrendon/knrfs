
import { useState } from "react";
import { toast } from "sonner";
import { EmployerType } from "@/types/loan";

export function useEmployerTypeSelection() {
  const [selectedEmployerType, setSelectedEmployerType] = useState<EmployerType>(null);

  const handleEmployerTypeSelect = (type: EmployerType) => {
    setSelectedEmployerType(type);
    toast.success(`Selected employer type: ${type}`);
  };

  return {
    selectedEmployerType,
    handleEmployerTypeSelect
  };
}
