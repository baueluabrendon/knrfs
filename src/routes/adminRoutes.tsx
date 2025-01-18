import { Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import Index from "@/pages/Index";
import Users from "@/pages/Users";
import Applications from "@/pages/Applications";
import Loans from "@/pages/Loans";
import AddLoan from "@/pages/AddLoan";
import BulkLoans from "@/pages/BulkLoans";
import Borrowers from "@/pages/Borrowers";
import BulkBorrowers from "@/pages/BulkBorrowers";
import Repayments from "@/pages/Repayments";
import LoansInArrears from "@/pages/LoansInArrears";
import MissedPayments from "@/pages/MissedPayments";
import PartialPayments from "@/pages/PartialPayments";
import ChartOfAccounts from "@/pages/ChartOfAccounts";
import BalanceSheet from "@/pages/BalanceSheet";
import ProfitAndLoss from "@/pages/ProfitAndLoss";
import Cashflow from "@/pages/Cashflow";
import Analytics from "@/pages/Analytics";

export const adminRoutes = [
  <Route
    key="dashboard"
    path="/"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "SALES_OFFICER", "ACCOUNTS_OFFICER", "RECOVERIES_OFFICER", "OFFICE_ADMIN"]}>
        <Index />
      </ProtectedRoute>
    }
  />,
  <Route
    key="users"
    path="/users"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER"]}>
        <Users />
      </ProtectedRoute>
    }
  />,
  <Route
    key="applications"
    path="/applications"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER"]}>
        <Applications />
      </ProtectedRoute>
    }
  />,
  <Route
    key="loans"
    path="/loans"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "SALES_OFFICER"]}>
        <Loans />
      </ProtectedRoute>
    }
  />,
  <Route
    key="addLoan"
    path="/loans/add"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "SALES_OFFICER"]}>
        <AddLoan />
      </ProtectedRoute>
    }
  />,
  <Route
    key="bulkLoans"
    path="/loans/bulk"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "SALES_OFFICER"]}>
        <BulkLoans />
      </ProtectedRoute>
    }
  />,
  <Route
    key="borrowers"
    path="/borrowers"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "SALES_OFFICER"]}>
        <Borrowers />
      </ProtectedRoute>
    }
  />,
  <Route
    key="bulkBorrowers"
    path="/borrowers/bulk"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "SALES_OFFICER"]}>
        <BulkBorrowers />
      </ProtectedRoute>
    }
  />,
  <Route
    key="repayments"
    path="/repayments"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "ACCOUNTS_OFFICER"]}>
        <Repayments />
      </ProtectedRoute>
    }
  />,
  <Route
    key="loansInArrears"
    path="/recoveries/arrears"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "RECOVERIES_OFFICER"]}>
        <LoansInArrears />
      </ProtectedRoute>
    }
  />,
  <Route
    key="missedPayments"
    path="/recoveries/missed"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "RECOVERIES_OFFICER"]}>
        <MissedPayments />
      </ProtectedRoute>
    }
  />,
  <Route
    key="partialPayments"
    path="/recoveries/partial"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "RECOVERIES_OFFICER"]}>
        <PartialPayments />
      </ProtectedRoute>
    }
  />,
  <Route
    key="chartOfAccounts"
    path="/accounting/chart-of-accounts"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "ACCOUNTS_OFFICER"]}>
        <ChartOfAccounts />
      </ProtectedRoute>
    }
  />,
  <Route
    key="balanceSheet"
    path="/accounting/balance-sheet"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "ACCOUNTS_OFFICER"]}>
        <BalanceSheet />
      </ProtectedRoute>
    }
  />,
  <Route
    key="profitLoss"
    path="/accounting/profit-loss"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "ACCOUNTS_OFFICER"]}>
        <ProfitAndLoss />
      </ProtectedRoute>
    }
  />,
  <Route
    key="cashflow"
    path="/accounting/cashflow"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "ACCOUNTS_OFFICER"]}>
        <Cashflow />
      </ProtectedRoute>
    }
  />,
  <Route
    key="analytics"
    path="/analytics"
    element={
      <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER"]}>
        <Analytics />
      </ProtectedRoute>
    }
  />,
];
