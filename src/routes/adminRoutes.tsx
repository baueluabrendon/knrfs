
import Loans from "@/pages/Loans";
import Borrowers from "@/pages/Borrowers";
import AddLoan from "@/pages/AddLoan";
import Users from "@/pages/Users";
import Repayments from "@/pages/Repayments";
import Applications from "@/pages/Applications";
import LoansInArrears from "@/pages/LoansInArrears";
import MissedPayments from "@/pages/MissedPayments";
import PartialPayments from "@/pages/PartialPayments";
import Analytics from "@/pages/Analytics";
import ChartOfAccounts from "@/pages/ChartOfAccounts";
import ProfitAndLoss from "@/pages/ProfitAndLoss";
import BalanceSheet from "@/pages/BalanceSheet";
import Cashflow from "@/pages/Cashflow";
import Index from "@/pages/Index";
import BulkLoans from "@/pages/BulkLoans";
import BulkBorrowers from "@/pages/BulkBorrowers";
import BulkRepayments from "@/pages/BulkRepayments";
import Recoveries from "@/pages/Recoveries";
import { RouteProps } from "react-router-dom";

// Define routes as an array of objects with path and element properties
interface AppRoute extends Omit<RouteProps, 'element'> {
  path: string;
  element: React.ReactNode;
}

// Admin routes without ProtectedRoute wrapper - will be applied in App.tsx
export const adminRoutes: AppRoute[] = [
  {
    path: "/admin",
    element: <Index />
  },
  {
    path: "/admin/loans",
    element: <Loans />
  },
  {
    path: "/admin/loans/add",
    element: <AddLoan />
  },
  {
    path: "/admin/loans/arrears",
    element: <LoansInArrears />
  },
  {
    path: "/admin/loans/missed",
    element: <MissedPayments />
  },
  {
    path: "/admin/loans/partial",
    element: <PartialPayments />
  },
  {
    path: "/admin/borrowers",
    element: <Borrowers />
  },
  {
    path: "/admin/users",
    element: <Users />
  },
  {
    path: "/admin/applications",
    element: <Applications />
  },
  {
    path: "/admin/repayments",
    element: <Repayments />
  },
  {
    path: "/admin/recoveries",
    element: <Recoveries />
  },
  {
    path: "/admin/analytics",
    element: <Analytics />
  },
  {
    path: "/admin/accounting/coa",
    element: <ChartOfAccounts />
  },
  {
    path: "/admin/accounting/pl",
    element: <ProfitAndLoss />
  },
  {
    path: "/admin/accounting/bs",
    element: <BalanceSheet />
  },
  {
    path: "/admin/accounting/cf",
    element: <Cashflow />
  },
  {
    path: "/admin/loans/bulk",
    element: <BulkLoans />
  },
  {
    path: "/admin/borrowers/bulk",
    element: <BulkBorrowers />
  },
  {
    path: "/admin/repayments/bulk",
    element: <BulkRepayments />
  },
];
