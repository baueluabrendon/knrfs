
import { Repayment } from "@/types/repayment";

export const sampleRepayments: Repayment[] = [
  {
    repayment_id: "1",
    payment_date: "2024-01-15",
    amount: 1500.00,
    loan_id: "LOAN-001",
    borrowerName: "John Doe",
    status: "completed",
    payPeriod: "January 2024",
    receipt_url: "#"
  },
  {
    repayment_id: "2",
    payment_date: "2024-01-14",
    amount: 2500.00,
    loan_id: "LOAN-002",
    borrowerName: "Jane Smith",
    status: "pending",
    payPeriod: "January 2024"
  },
  {
    repayment_id: "3",
    payment_date: "2024-01-13",
    amount: 1000.00,
    loan_id: "LOAN-003",
    borrowerName: "Bob Wilson",
    status: "completed",
    payPeriod: "January 2024",
    receipt_url: "#"
  }
];
