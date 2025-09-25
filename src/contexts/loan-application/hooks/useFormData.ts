
import { useState, useEffect } from "react";
import { FormDataType } from "@/types/loan";
import { defaultFormData } from "../default-values";
import { submitApplication } from "../submit-application";

// Optionally define the expected structure for extractedData
type ExtractedDataType = Partial<FormDataType>;

export function useFormData(applicationUuid: string) {
  const [formData, setFormData] = useState<FormDataType>({ ...defaultFormData });
  const [refinanceContext, setRefinanceContext] = useState<any>(null);

  useEffect(() => {
    // Check for refinance context from sessionStorage
    const storedContext = sessionStorage.getItem('refinanceContext');
    if (storedContext) {
      try {
        const context = JSON.parse(storedContext);
        if (context.type === 'refinance') {
          setRefinanceContext(context);
          
          // Pre-populate form data for refinance if needed
          // You can set default values based on original loan here
          console.log('Refinance context loaded:', context);
        }
      } catch (error) {
        console.error('Error parsing refinance context:', error);
      }
    }
  }, []);

  const updateFormData = (section: keyof FormDataType, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data
      }
    }));
  };

  const updateExtractedData = (extractedData: ExtractedDataType) => {
    if (!extractedData) return;

    setFormData(prevData => ({
      personalDetails: {
        ...prevData.personalDetails,
        ...(extractedData.personalDetails ?? {})
      },
      employmentDetails: {
        ...prevData.employmentDetails,
        ...(extractedData.employmentDetails ?? {})
      },
      residentialDetails: {
        ...prevData.residentialDetails,
        ...(extractedData.residentialDetails ?? {})
      },
      financialDetails: {
        ...prevData.financialDetails,
        ...(extractedData.financialDetails ?? {})
      },
      loanFundingDetails: {
        ...prevData.loanFundingDetails,
        ...(extractedData.loanFundingDetails ?? {})
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await submitApplication(formData, applicationUuid, refinanceContext);
    
    if (success) {
      // Clear refinance context after successful submission
      sessionStorage.removeItem('refinanceContext');
      
      setTimeout(() => {
        window.location.href = refinanceContext ? '/client' : '/';
      }, 2000);
    }
  };

  return {
    formData,
    updateFormData,
    updateExtractedData,
    handleSubmit,
    refinanceContext
  };
}
