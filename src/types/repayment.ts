
export interface Repayment {
  repayment_id: string; // Changed from id: string to match database column name
  payment_date: string; // Changed from date: string to match database column name
  amount: number;
  loan_id: string; // Changed from loanId: string to match database column name
  borrowerName: string;
  status: "pending" | "completed" | "failed" | "approved" | "rejected";
  payPeriod: string;
  receipt_url?: string; // Changed from receiptUrl?: string to match database column name
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
