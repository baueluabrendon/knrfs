
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FormDataType } from "@/types/loan";

export async function processApplicationFormOCR(file: File, applicationUuid: string): Promise<Partial<FormDataType> | null> {
  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicationUuid', applicationUuid);
    
    // Call the Supabase Edge Function for OCR processing using the provided URL with HTTPS
    const functionUrl = "https://mhndkefbyvxasvayigvx.supabase.co/functions/v1/process-application-form";
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    
    // For public access, we don't require authentication
    const headers: HeadersInit = {
      // Add authorization header only if token exists
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    
    console.log("Calling OCR processing function:", functionUrl);
    const response = await fetch(functionUrl, {
      method: 'POST',
      body: formData,
      headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OCR processing failed:", errorText);
      throw new Error(`OCR processing failed: ${response.status} ${errorText || response.statusText}`);
    }
    
    const result = await response.json();
    console.log("OCR processing result:", result);
    
    // Update the jsonb_data column in the applications table with the extracted data
    const { error } = await supabase
      .from('applications')
      .update({ jsonb_data: result })
      .eq('application_id', applicationUuid);
    
    if (error) {
      console.error("Failed to update application with extracted data:", error);
      throw error;
    }
    
    return {
      personalDetails: {
        firstName: result.firstName || '',
        middleName: result.middleName || '',
        lastName: result.lastName || '',
        dateOfBirth: result.dateOfBirth || '',
        gender: result.gender || '',
        email: result.email || '',
        phone: result.phone || '',
        idType: result.idType || '',
        idNumber: result.idNumber || '',
        nationality: result.nationality || '',
        maritalStatus: result.maritalStatus || '',
        spouseFirstName: result.spouseFirstName || '',
        spouseLastName: result.spouseLastName || '',
        spouseEmployerName: result.spouseEmployerName || '',
        spouseContactDetails: result.spouseContactDetails || ''
      },
      employmentDetails: {
        employerName: result.employerName || '',
        employmentDate: result.employmentDate || '',
        occupation: result.occupation || '',
        salary: result.salary || '',
        payDay: result.payDay || '',
        fileNumber: result.fileNumber || '',
        position: result.position || '',
        postalAddress: result.postalAddress || '',
        workPhoneNumber: result.workPhoneNumber || '',
        fax: result.fax || '',
        paymaster: result.paymaster || ''
      },
      residentialDetails: {
        address: result.address || '',
        suburb: result.suburb || '',
        city: result.city || '',
        province: result.province || '',
        postalCode: result.postalCode || '',
        residentialStatus: result.residentialStatus || '',
        yearsAtAddress: result.yearsAtAddress || '',
        lot: result.lot || '',
        section: result.section || '',
        streetName: result.streetName || '',
        village: result.village || '',
        district: result.district || ''
      },
      financialDetails: {
        monthlyIncome: result.monthlyIncome || '',
        otherIncome: result.otherIncome || '',
        totalExpenses: result.totalExpenses || '',
        loanAmount: result.loanAmount || '',
        loanPurpose: result.loanPurpose || '',
        loanTerm: result.loanTerm || '',
        interestRate: result.interestRate || '',
        loanRiskInsurance: result.loanRiskInsurance || '',
        documentationFee: result.documentationFee || '',
        fortnightlyInstallment: result.fortnightlyInstallment || '',
        grossLoan: result.grossLoan || '',
        bank: result.bank || '',
        bankBranch: result.bankBranch || '',
        bsbCode: result.bsbCode || '',
        accountName: result.accountName || '',
        accountNumber: result.accountNumber || '',
        accountType: result.accountType || ''
      }
    };
  } catch (error) {
    console.error('Error processing application form:', error);
    toast.error('Failed to process application form');
    return null;
  }
}
