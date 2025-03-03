
export interface Repayment {
  id: string;
  date: string;
  amount: number;
  loanId: string;
  borrowerName: string;
  status: "pending" | "completed" | "failed";
  payPeriod: string;
  receiptUrl?: string;
}
