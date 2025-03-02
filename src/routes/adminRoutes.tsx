
import { Route, Routes } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "@/pages/Index";
import Loans from "@/pages/Loans";
import Borrowers from "@/pages/Borrowers";
import Applications from "@/pages/Applications";
import Repayments from "@/pages/Repayments";
import LoansInArrears from "@/pages/LoansInArrears";
import MissedPayments from "@/pages/MissedPayments";
import PartialPayments from "@/pages/PartialPayments";
import Recoveries from "@/pages/Recoveries";
import Users from "@/pages/Users";
import AddLoan from "@/pages/AddLoan";
import BulkLoans from "@/pages/BulkLoans";
import BulkBorrowers from "@/pages/BulkBorrowers";
import Analytics from "@/pages/Analytics";
import BalanceSheet from "@/pages/BalanceSheet";
import ProfitAndLoss from "@/pages/ProfitAndLoss";
import Cashflow from "@/pages/Cashflow";
import ChartOfAccounts from "@/pages/ChartOfAccounts";

export const adminRoutes = (
  <Routes>
    <Route element={<DashboardLayout />}>
      <Route index element={<Index />} />  
      <Route path="loans/view" element={<Loans />} />
      <Route path="borrowers" element={<Borrowers />} />
      <Route path="applications" element={<Applications />} />
      <Route path="repayments" element={<Repayments />} />
      <Route path="recoveries/loans-in-arrears" element={<LoansInArrears />} />
      <Route path="recoveries/missed-payments" element={<MissedPayments />} />
      <Route path="recoveries/partial-payments" element={<PartialPayments />} />
      <Route path="recoveries" element={<Recoveries />} />
      <Route path="users" element={<Users />} />
      <Route path="loans/add" element={<AddLoan />} />
      <Route path="loans/bulk" element={<BulkLoans />} />
      <Route path="borrowers/bulk" element={<BulkBorrowers />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="accounting/balance-sheet" element={<BalanceSheet />} />
      <Route path="accounting/profit-loss" element={<ProfitAndLoss />} />
      <Route path="accounting/cashflow" element={<Cashflow />} />
      <Route path="accounting/chart-of-accounts" element={<ChartOfAccounts />} />

      {/* Catch-all for unknown admin routes, redirect to index */}
      <Route path="*" element={<Index />} />
    </Route>
  </Routes>
);
