
import { useState } from "react";
import { FormDataType } from "@/types/loan";
import { defaultFormData } from "../default-values";
import { submitApplication } from "../submit-application";

export function useFormData(applicationUuid: string) {
  const [formData, setFormData] = useState<FormDataType>({ ...defaultFormData });

  const updateFormData = (section: keyof FormDataType, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data
      }
    }));
  };

  const updateExtractedData = (extractedData: any) => {
    if (!extractedData) return;
    
    setFormData(prevData => ({
      personalDetails: {
        ...prevData.personalDetails,
        ...extractedData.personalDetails
      },
      employmentDetails: {
        ...prevData.employmentDetails,
        ...extractedData.employmentDetails
      },
      residentialDetails: {
        ...prevData.residentialDetails,
        ...extractedData.residentialDetails
      },
      financialDetails: {
        ...prevData.financialDetails,
        ...extractedData.financialDetails
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await submitApplication(formData, applicationUuid);
    
    if (success) {
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  };

  return {
    formData,
    updateFormData,
    updateExtractedData,
    handleSubmit
  };
}
