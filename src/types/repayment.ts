
export interface Repayment {
  repayment_id: string;
  payment_date: string;
  amount: number;
  loan_id: string;
  borrowerName: string;
  status: "pending" | "completed" | "failed" | "approved" | "rejected";
  receipt_url?: string;
  notes?: string;
  source?: "system" | "client";
  verification_status?: "pending" | "approved" | "rejected";
  verified_at?: string;
  verified_by?: string;
}

export interface BulkRepaymentData {
  payment_date: string;
  amount: number;
  loan_id: string;
  borrowerName: string;
  notes?: string;
  status?: "pending" | "completed" | "failed" | "approved" | "rejected";
}
