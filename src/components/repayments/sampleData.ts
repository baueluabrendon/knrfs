
import { Repayment } from "@/types/repayment";

export const sampleRepayments: Repayment[] = [
  {
    id: "1",
    date: "2024-01-15",
    amount: 1500.00,
    loanId: "LOAN-001",
    borrowerName: "John Doe",
    status: "completed",
    payPeriod: "January 2024",
    receiptUrl: "#"
  },
  {
    id: "2",
    date: "2024-01-14",
    amount: 2500.00,
    loanId: "LOAN-002",
    borrowerName: "Jane Smith",
    status: "pending",
    payPeriod: "January 2024"
  },
  {
    id: "3",
    date: "2024-01-13",
    amount: 1000.00,
    loanId: "LOAN-003",
    borrowerName: "Bob Wilson",
    status: "completed",
    payPeriod: "January 2024",
    receiptUrl: "#"
  }
];
