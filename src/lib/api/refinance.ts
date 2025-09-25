import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Processes a refinance application when it's approved
 * This creates the new loan and links it to the old one
 */
export const processRefinanceApproval = async (
  applicationId: string,
  newLoanData: any,
  originalLoanId: string
) => {
  try {
    // Start a transaction-like process by updating multiple tables
    
    // 1. Create the new loan with refinance tracking
    const { data: newLoan, error: loanError } = await supabase
      .from('loans')
      .insert({
        ...newLoanData,
        refinanced: 'internal', // Mark as internal refinance
        refinanced_by: originalLoanId, // Link to original loan
      })
      .select()
      .single();

    if (loanError) throw loanError;

    // 2. Update the original loan to mark it as refinanced
    const { error: originalLoanError } = await supabase
      .from('loans')
      .update({
        loan_status: 'settled',
        settled_date: new Date().toISOString().split('T')[0],
        refinanced: 'internal',
        refinanced_by: newLoan.loan_id, // Link back to new loan
      })
      .eq('loan_id', originalLoanId);

    if (originalLoanError) throw originalLoanError;

    // 3. Update the application status to approved
    const { error: appError } = await supabase
      .from('applications')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('application_id', applicationId);

    if (appError) throw appError;

    return {
      success: true,
      newLoanId: newLoan.loan_id,
      originalLoanId: originalLoanId,
    };

  } catch (error) {
    console.error('Error processing refinance approval:', error);
    toast.error('Failed to process refinance approval');
    throw error;
  }
};

/**
 * Gets refinance eligibility for a specific loan
 */
export const checkRefinanceEligibility = async (loanId: string) => {
  try {
    const { data: loan, error } = await supabase
      .from('loans')
      .select('loan_status, repayment_completion_percentage, outstanding_balance')
      .eq('loan_id', loanId)
      .single();

    if (error) throw error;

    const isEligible = 
      loan.loan_status === 'active' &&
      (loan.repayment_completion_percentage || 0) >= 85 &&
      (loan.outstanding_balance || 0) > 0;

    return {
      isEligible,
      loan,
      reason: !isEligible ? 
        `Loan must be active with at least 85% completion. Current: ${loan.repayment_completion_percentage?.toFixed(1)}%` :
        `Eligible for refinancing (${loan.repayment_completion_percentage?.toFixed(1)}% completed)`
    };

  } catch (error) {
    console.error('Error checking refinance eligibility:', error);
    return {
      isEligible: false,
      loan: null,
      reason: 'Error checking eligibility'
    };
  }
};

/**
 * Gets all refinance applications for a client
 */
export const getClientRefinanceApplications = async (userEmail: string) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        application_id,
        status,
        uploaded_at,
        updated_at,
        application_type,
        refinanced_from_loan_id,
        jsonb_data
      `)
      .eq('application_type', 'refinance')
      .eq('jsonb_data->>email', userEmail)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];

  } catch (error) {
    console.error('Error fetching refinance applications:', error);
    return [];
  }
};