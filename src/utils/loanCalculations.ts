
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
 * Calculates the fortnightly installment amount based on gross loan and loan term
 * Formula: Bi-Weekly Repayment = Gross Loan divided by Loan Term
 */
export const calculateFortnightlyInstallment = (
  grossLoan: number,
  loanTerm: number
): number => {
  if (grossLoan <= 0 || loanTerm <= 0) return 0;
  
  // Calculation based on formula: Bi-Weekly Repayment = Gross Loan divided by Loan Term
  const installment = grossLoan / loanTerm;
  
  return Number(installment.toFixed(2));
};

/**
 * Calculates various loan values based on principal and loan term
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
  
  // Get interest rate from the mapping based on loan term
  const interestRate = LOAN_TERM_INTEREST_RATE_MAP[loanTerm] || 0;
  
  // Calculate interest amount based on formula: Interest = Loan Amount * Interest Rate
  const interest = (principal * interestRate) / 100;
  
  // Calculate loan risk insurance (2% of principal)
  const loanRiskInsurance = principal * 0.02;
  
  // Fixed documentation fee
  const documentationFee = 50;
  
  // Calculate gross loan based on formula: 
  // Gross Loan = (principal) + (interest) + (loanRiskInsurance) + (documentationFee)
  const grossLoan = (principal) + (interest) + (loanRiskInsurance) + (documentationFee);
  
  // Calculate fortnightly installment using the formula: Bi-Weekly Repayment = Gross Loan divided by Loan Term
  const fortnightlyInstallment = calculateFortnightlyInstallment(grossLoan, loanTerm);
  
  return {
    fortnightlyInstallment,
    grossLoan,
    interest,
    interestRate,
    loanRiskInsurance,
    documentationFee
  };
};
