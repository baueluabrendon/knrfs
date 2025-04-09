
export interface Repayment {
  id: string;
  date: string;
  amount: number;
  loanId: string;
  borrowerName: string;
  status: "pending" | "completed" | "failed" | "approved" | "rejected";
  payPeriod: string;
  receiptUrl?: string;
  notes?: string;
}

export interface BulkRepaymentData {
  date: string;
  amount: number;
  loanId: string;
  borrowerName: string;
  payPeriod: string;
  status?: "pending" | "completed" | "failed" | "approved" | "rejected";
  notes?: string;
}
