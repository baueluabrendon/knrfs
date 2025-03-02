
/**
 * Calculates the fortnightly installment amount based on principal and loan term
 */
export const calculateFortnightlyInstallment = (
  principal: number,
  loanTerm: number
): number => {
  if (principal <= 0 || loanTerm <= 0) return 0;
  
  // Simple calculation for demonstration - in reality would include interest
  const totalRepayment = principal * 1.1; // Example: 10% total interest
  const installment = totalRepayment / (loanTerm * 2); // Assuming fortnightly payments
  
  return Number(installment.toFixed(2));
};

/**
 * Calculates various loan values based on principal and loan term
 */
export const calculateLoanValues = (
  principal: number,
  loanTerm: number
) => {
  if (principal <= 0 || loanTerm <= 0) {
    return {
      fortnightlyInstallment: 0,
      grossLoan: 0,
      interest: 0,
      interestRate: 0,
      loanRiskInsurance: 0
    };
  }
  
  // Set standard interest rate (10% for example)
  const interestRate = 10;
  
  // Calculate interest amount based on principal, term and rate
  const interest = (principal * interestRate * loanTerm) / (12 * 100);
  
  // Calculate loan risk insurance (1% of principal)
  const loanRiskInsurance = principal * 0.01;
  
  // Calculate gross loan (principal + interest + insurance)
  const grossLoan = principal + interest + loanRiskInsurance;
  
  // Calculate fortnightly installment
  const fortnightlyInstallment = calculateFortnightlyInstallment(principal, loanTerm);
  
  return {
    fortnightlyInstallment,
    grossLoan,
    interest,
    interestRate,
    loanRiskInsurance
  };
};
