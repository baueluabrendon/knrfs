
import { RouteObject } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

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

// Define admin routes with proper nesting
export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Index />
      },
      {
        path: "loans",
        element: <Loans />
      },
      {
        path: "loans/add",
        element: <AddLoan />
      },
      {
        path: "loans/arrears",
        element: <LoansInArrears />
      },
      {
        path: "loans/missed",
        element: <MissedPayments />
      },
      {
        path: "loans/partial",
        element: <PartialPayments />
      },
      {
        path: "borrowers",
        element: <Borrowers />
      },
      {
        path: "users",
        element: <Users />
      },
      {
        path: "applications",
        element: <Applications />
      },
      {
        path: "repayments",
        element: <Repayments />
      },
      {
        path: "recoveries",
        element: <Recoveries />
      },
      {
        path: "analytics",
        element: <Analytics />
      },
      {
        path: "accounting/coa",
        element: <ChartOfAccounts />
      },
      {
        path: "accounting/pl",
        element: <ProfitAndLoss />
      },
      {
        path: "accounting/bs",
        element: <BalanceSheet />
      },
      {
        path: "accounting/cf",
        element: <Cashflow />
      },
      {
        path: "loans/bulk",
        element: <BulkLoans />
      },
      {
        path: "borrowers/bulk",
        element: <BulkBorrowers />
      },
      {
        path: "repayments/bulk",
        element: <BulkRepayments />
      }
    ]
  }
];
