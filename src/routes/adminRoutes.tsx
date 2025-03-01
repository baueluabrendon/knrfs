
import { Route } from "react-router-dom";
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
  <Route path="/" element={<DashboardLayout />}>
    <Route index element={<Index />} />
    <Route path="loans" element={<Loans />} />
    <Route path="borrowers" element={<Borrowers />} />
    <Route path="applications" element={<Applications />} />
    <Route path="repayments" element={<Repayments />} />
    <Route path="loans-in-arrears" element={<LoansInArrears />} />
    <Route path="missed-payments" element={<MissedPayments />} />
    <Route path="partial-payments" element={<PartialPayments />} />
    <Route path="recoveries" element={<Recoveries />} />
    <Route path="users" element={<Users />} />
    <Route path="add-loan" element={<AddLoan />} />
    <Route path="bulk-loans" element={<BulkLoans />} />
    <Route path="bulk-borrowers" element={<BulkBorrowers />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="balance-sheet" element={<BalanceSheet />} />
    <Route path="profit-and-loss" element={<ProfitAndLoss />} />
    <Route path="cashflow" element={<Cashflow />} />
    <Route path="chart-of-accounts" element={<ChartOfAccounts />} />
  </Route>
);
