
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FormDataType } from "@/types/loan";

export async function processApplicationFormOCR(file: File): Promise<Partial<FormDataType> | null> {
  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Call the Supabase Edge Function for OCR processing
    const functionUrl = `${process.env.SUPABASE_URL}/functions/v1/process-application-form`;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    
    // For public access, we don't require authentication
    const headers: HeadersInit = {
      // Add authorization header only if token exists
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      body: formData,
      headers,
    });
    
    if (!response.ok) {
      throw new Error('OCR processing failed');
    }
    
    const result = await response.json();
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
