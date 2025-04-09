
export interface Repayment {
  repayment_id: string;
  payment_date: string;
  amount: number;
  loan_id: string;
  borrowerName: string;
  status: "pending" | "completed" | "failed" | "approved" | "rejected";
  payPeriod: string;
  receipt_url?: string;
  notes?: string;
}

export interface BulkRepaymentData {
  payment_date: string;
  amount: number;
  loan_id: string;
  borrowerName: string;
  payPeriod: string;
  status?: "pending" | "completed" | "failed" | "approved" | "rejected";
  notes?: string;
}
