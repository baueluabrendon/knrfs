
import { Route, RouteProps } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
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

// Define routes as an array of objects with path and element properties
interface AppRoute extends Omit<RouteProps, 'element'> {
  path: string;
  element: React.ReactNode;
}

export const adminRoutes: AppRoute[] = [
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <Index />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/loans",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <Loans />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/loans/add",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <AddLoan />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/loans/arrears",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <LoansInArrears />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/loans/missed",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <MissedPayments />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/loans/partial",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <PartialPayments />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/borrowers",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <Borrowers />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <Users />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/applications",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <Applications />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/repayments",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <Repayments />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/recoveries",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <Recoveries />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/analytics",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <Analytics />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/accounting/coa",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <ChartOfAccounts />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/accounting/pl",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <ProfitAndLoss />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/accounting/bs",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <BalanceSheet />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/accounting/cf",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <Cashflow />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/loans/bulk",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <BulkLoans />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/borrowers/bulk",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <BulkBorrowers />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/repayments/bulk",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <BulkRepayments />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
];
