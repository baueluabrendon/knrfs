
/**
 * Processes an application form using OCR to extract information
 * @param file The application form file
 * @param applicationUuid The UUID of the application being processed
 * @returns The extracted data from the form
 */
export const processApplicationFormOCR = async (file: File, applicationUuid: string): Promise<any> => {
  try {
    console.log("Processing application form with OCR...");
    
    // Create form data for the API request
    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicationUuid", applicationUuid);
    
    const response = await fetch("https://mhndkefbyvxasvayigvx.supabase.co/functions/v1/process-application-form", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OCR processing failed: ${errorText}`);
    }
    
    const extractedData = await response.json();
    console.log("Extracted data:", extractedData);
    
    return {
      personalDetails: {
        firstName: extractedData.firstName || "",
        middleName: extractedData.middleName || "",
        lastName: extractedData.lastName || "",
        dateOfBirth: extractedData.dateOfBirth || "",
        gender: extractedData.gender || "",
        email: extractedData.email || "",
        phone: extractedData.phone || "",
        idType: extractedData.idType || "",
        idNumber: extractedData.idNumber || "",
      },
      employmentDetails: {
        employerName: extractedData.employerName || "",
        employmentDate: extractedData.employmentDate || "",
        occupation: extractedData.occupation || "",
        salary: extractedData.salary || "",
        payDay: extractedData.payDay || "",
      },
      residentialDetails: {
        address: extractedData.address || "",
        suburb: extractedData.suburb || "",
        city: extractedData.city || "",
        province: extractedData.province || "",
        postalCode: extractedData.postalCode || "",
        residentialStatus: extractedData.residentialStatus || "",
        yearsAtAddress: extractedData.yearsAtAddress || "",
      },
      financialDetails: {
        monthlyIncome: extractedData.monthlyIncome || "",
        otherIncome: extractedData.otherIncome || "",
        totalExpenses: extractedData.totalExpenses || "",
        loanAmount: extractedData.loanAmount || "",
        loanPurpose: extractedData.loanPurpose || "",
        loanTerm: extractedData.loanTerm || "",
        interest: extractedData.interest || "",
        interestRate: extractedData.interestRate || "",
        loanRiskInsurance: extractedData.loanRiskInsurance || "",
        documentationFee: extractedData.documentationFee || "",
        fortnightlyInstallment: extractedData.fortnightlyInstallment || "",
        grossLoan: extractedData.grossLoan || "",
      }
    };
  } catch (error) {
    console.error("Error in OCR processing:", error);
    throw error;
  }
};
