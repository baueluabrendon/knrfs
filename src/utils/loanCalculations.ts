
/**
 * Map of loan terms (bi-weekly periods) to their corresponding interest rates
 */
export const LOAN_TERM_INTEREST_RATE_MAP: Record<number, number> = {
  5: 20,
  6: 22,
  7: 24,
  8: 26,
  9: 28,
  10: 30,
  12: 34,
  14: 38,
  16: 42,
  18: 46,
  20: 50,
  22: 54,
  24: 58,
  26: 62,
  28: 66,
  30: 70,
};

/**
 * Valid bi-weekly loan term options
 */
export const VALID_LOAN_TERMS = Object.keys(LOAN_TERM_INTEREST_RATE_MAP).map(Number);

/**
 * Calculates the fortnightly installment amount based on gross loan and loan term.
 * Formula: Bi-Weekly Repayment = Gross Loan divided by Loan Term
 */
export const calculateFortnightlyInstallment = (
  grossLoan: number,
  loanTerm: number
): number => {
  if (grossLoan <= 0 || loanTerm <= 0) return 0;
  
  // Calculation based on formula: Bi-Weekly Repayment = Gross Loan divided by Loan Term
  const installment = grossLoan / loanTerm;
  
  // Round to 2 decimal places
  return Math.round(installment * 100) / 100;
};

/**
 * Calculates various loan values based on principal and loan term.
 * 
 * Formulas:
 * - Interest = (principal * interestRate) / 100
 * - Loan Risk Insurance = 2% of principal
 * - Gross Loan = Principal + Interest + Loan Risk Insurance + Documentation Fee
 * - Fortnightly Installment = Gross Loan / Loan Term
 */
export const calculateLoanValues = (
  principal: number,
  loanTerm: number
) => {
  if (principal <= 0 || !VALID_LOAN_TERMS.includes(loanTerm)) {
    return {
      fortnightlyInstallment: 0,
      grossLoan: 0,
      interest: 0,
      interestRate: 0,
      loanRiskInsurance: 0,
      documentationFee: 0
    };
  }
  
  // Get interest rate from the mapping based on loan term.
  const interestRate = LOAN_TERM_INTEREST_RATE_MAP[loanTerm] || 0;
  
  // Calculate interest amount based on formula: Interest = principal * interestRate / 100
  const interest = (principal * interestRate) / 100;
  
  // Calculate loan risk insurance (2% of principal)
  const loanRiskInsurance = principal * 0.02;
  
  // Fixed documentation fee
  const documentationFee = 50;
  
  // Calculate gross loan as a number
  const grossLoan =
    Number(principal) +
    Number(interest) +
    Number(loanRiskInsurance) +
    Number(documentationFee);
  
  // Calculate fortnightly installment using the formula: Bi-Weekly Repayment = Gross Loan divided by Loan Term
  const fortnightlyInstallment = calculateFortnightlyInstallment(grossLoan, loanTerm);
  
  // Return values rounded to 2 decimal places for consistency
  return {
    fortnightlyInstallment,
    grossLoan: Math.round(grossLoan * 100) / 100,
    interest: Math.round(interest * 100) / 100,
    interestRate,
    loanRiskInsurance: Math.round(loanRiskInsurance * 100) / 100,
    documentationFee
  };
};
