
import { RouteObject } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import ActivityLogs from "@/pages/ActivityLogs";
import { menuItems } from "@/config/menuItems";

import Loans from "@/pages/Loans";
import Borrowers from "@/pages/Borrowers";
import AddLoan from "@/pages/AddLoan";
import Users from "@/pages/Users";
import Repayments from "@/pages/Repayments";
import Applications from "@/pages/Applications";
import Reports from "@/pages/Reports";
import UsersReport from "@/pages/reports/UsersReport";
import BorrowersReport from "@/pages/reports/BorrowersReport";
import ApplicationsReport from "@/pages/reports/ApplicationsReport";
import LoansReport from "@/pages/reports/LoansReport";
import RepaymentsReport from "@/pages/reports/RepaymentsReport";
import RecoveriesReport from "@/pages/reports/RecoveriesReport";
import PromotionsReport from "@/pages/reports/PromotionsReport";
import Promotions from "@/pages/Promotions";
import ChartOfAccounts from "@/pages/ChartOfAccounts";
import ProfitAndLoss from "@/pages/ProfitAndLoss";
import BalanceSheet from "@/pages/BalanceSheet";
import Cashflow from "@/pages/Cashflow";
import Index from "@/pages/Index";
import BulkLoans from "@/pages/BulkLoans";
import BulkBorrowers from "@/pages/BulkBorrowers";
import BulkRepayments from "@/pages/BulkRepayments";
import Recoveries from "@/pages/Recoveries";
import LoansInArrears from "@/pages/LoansInArrears";
import MissedPayments from "@/pages/MissedPayments";
import PartialPayments from "@/pages/PartialPayments";
import ClientRepaymentVerification from "@/pages/ClientRepaymentVerification";
import AILoanAssistant from "@/components/ai-assistant/AILoanAssistant";
import AIReporting from "@/pages/AIReporting";
import BranchManagement from "@/pages/BranchManagement";

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
        path: "borrowers",
        element: <Borrowers />
      },
      {
        path: "users",
        element: <Users />
      },
      {
        path: "branches",
        element: <BranchManagement />
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
        path: "client-repayments",
        element: <ClientRepaymentVerification />
      },
      {
        path: "recoveries",
        element: <Recoveries />
      },
      {
        path: "recoveries/loans-in-arrears",
        element: <LoansInArrears />
      },
      {
        path: "recoveries/missed-payments",
        element: <MissedPayments />
      },
      {
        path: "recoveries/partial-payments",
        element: <PartialPayments />
      },
      {
        path: "reports",
        element: <Reports />
      },
      {
        path: "reports/users",
        element: <UsersReport />
      },
      {
        path: "reports/borrowers",
        element: <BorrowersReport />
      },
      {
        path: "reports/applications",
        element: <ApplicationsReport />
      },
      {
        path: "reports/loans",
        element: <LoansReport />
      },
      {
        path: "reports/repayments",
        element: <RepaymentsReport />
      },
      {
        path: "reports/recoveries",
        element: <RecoveriesReport />
      },
      {
        path: "reports/promotions",
        element: <PromotionsReport />
      },
      {
        path: "promotions",
        element: <Promotions />
      },
      {
        path: "accounting/chart-of-accounts",
        element: <ChartOfAccounts />
      },
      {
        path: "accounting/profit-loss",
        element: <ProfitAndLoss />
      },
      {
        path: "accounting/balance-sheet",
        element: <BalanceSheet />
      },
      {
        path: "accounting/cashflow",
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
      },
      {
        path: "ai-assistant",
        element: <AILoanAssistant />
      },
      {
        path: "ai-reporting",
        element: <AIReporting />
      },
      {
        path: "activity-logs",
        element: <ActivityLogs />
      }
    ]
  }
];
