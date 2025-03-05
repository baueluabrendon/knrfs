
import { Route, Routes } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";

// Direct imports (faster navigation)
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
import BulkRepayments from "@/pages/BulkRepayments";
import Analytics from "@/pages/Analytics";
import BalanceSheet from "@/pages/BalanceSheet";
import ProfitAndLoss from "@/pages/ProfitAndLoss";
import Cashflow from "@/pages/Cashflow";
import ChartOfAccounts from "@/pages/ChartOfAccounts";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route 
        element={
          <ProtectedRoute 
            allowedRoles={[
              "administrator",
              "super_user",
              "sales_officer",
              "accounts_officer",
              "recoveries_officer",
            ]}
          />
        }
      >
        {/* Wrap all pages inside DashboardLayout */}
        <Route element={<DashboardLayout />}>
          <Route index element={<Index />} />

          {/* Loans Management */}
          <Route path="loans/view" element={<Loans />} />
          <Route path="loans/add" element={<AddLoan />} />
          <Route path="loans/bulk" element={<BulkLoans />} />

          {/* Borrowers Management */}
          <Route path="borrowers" element={<Borrowers />} />
          <Route path="borrowers/bulk" element={<BulkBorrowers />} />

          {/* Applications */}
          <Route path="applications" element={<Applications />} />

          {/* Repayments */}
          <Route path="repayments" element={<Repayments />} />
          <Route path="repayments/bulk" element={<BulkRepayments />} />

          {/* Recoveries */}
          <Route path="recoveries" element={<Recoveries />} />
          <Route path="recoveries/loans-in-arrears" element={<LoansInArrears />} />
          <Route path="recoveries/missed-payments" element={<MissedPayments />} />
          <Route path="recoveries/partial-payments" element={<PartialPayments />} />

          {/* Users & Analytics */}
          <Route path="users" element={<Users />} />
          <Route path="analytics" element={<Analytics />} />

          {/* Accounting */}
          <Route path="accounting/balance-sheet" element={<BalanceSheet />} />
          <Route path="accounting/profit-loss" element={<ProfitAndLoss />} />
          <Route path="accounting/cashflow" element={<Cashflow />} />
          <Route path="accounting/chart-of-accounts" element={<ChartOfAccounts />} />

          {/* Catch-all: Redirect to dashboard index */}
          <Route path="*" element={<Index />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;

// Named export for App.tsx
export const adminRoutes = <AdminRoutes />;
