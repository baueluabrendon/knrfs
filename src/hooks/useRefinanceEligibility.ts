import { useMemo } from "react";

interface Loan {
  loan_id: string;
  loan_status?: string;
  repayment_completion_percentage?: number;
  outstanding_balance?: number;
}

export const useRefinanceEligibility = (loan: Loan | null) => {
  return useMemo(() => {
    if (!loan) return { isEligible: false, reason: "No loan data" };

    // Check if loan is active
    if (loan.loan_status !== 'active') {
      return { 
        isEligible: false, 
        reason: `Loan must be active to refinance. Current status: ${loan.loan_status}` 
      };
    }

    // Check if loan is at least 85% completed
    const completionPercentage = loan.repayment_completion_percentage || 0;
    if (completionPercentage < 85) {
      return { 
        isEligible: false, 
        reason: `Loan must be at least 85% repaid. Current: ${completionPercentage.toFixed(1)}%` 
      };
    }

    // Check if there's outstanding balance (loan not fully settled)
    if (!loan.outstanding_balance || loan.outstanding_balance <= 0) {
      return { 
        isEligible: false, 
        reason: "Loan appears to be fully settled" 
      };
    }

    return { 
      isEligible: true, 
      reason: `Eligible for refinancing (${completionPercentage.toFixed(1)}% completed)` 
    };
  }, [loan]);
};