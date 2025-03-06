
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
    
    // Get the Supabase anon key for authentication
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch("https://mhndkefbyvxasvayigvx.supabase.co/functions/v1/process-application-form", {
        method: "POST",
        headers: {
          // Add the authorization header
          "Authorization": `Bearer ${supabaseAnonKey}`
        },
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OCR processing response error:", response.status, errorText);
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
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error("OCR processing request timed out");
        throw new Error("OCR processing timed out. Please try again.");
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Error in OCR processing:", error);
    
    // For 502 errors, provide a more helpful message
    if (error.message && error.message.includes("502")) {
      throw new Error("The OCR service is currently unavailable. This could be due to server maintenance or high traffic. Please try again later.");
    }
    
    throw error;
  }
};
