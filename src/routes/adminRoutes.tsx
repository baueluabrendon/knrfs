
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2 } from "lucide-react";
import { ProtectedRoute } from "./ProtectedRoute";

// Lazy load pages for better performance
const Index = lazy(() => import("@/pages/Index"));
const Loans = lazy(() => import("@/pages/Loans"));
const Borrowers = lazy(() => import("@/pages/Borrowers"));
const Applications = lazy(() => import("@/pages/Applications"));
const Repayments = lazy(() => import("@/pages/Repayments"));
const LoansInArrears = lazy(() => import("@/pages/LoansInArrears"));
const MissedPayments = lazy(() => import("@/pages/MissedPayments"));
const PartialPayments = lazy(() => import("@/pages/PartialPayments"));
const Recoveries = lazy(() => import("@/pages/Recoveries"));
const Users = lazy(() => import("@/pages/Users"));
const AddLoan = lazy(() => import("@/pages/AddLoan"));
const BulkLoans = lazy(() => import("@/pages/BulkLoans"));
const BulkBorrowers = lazy(() => import("@/pages/BulkBorrowers"));
const BulkRepayments = lazy(() => import("@/pages/BulkRepayments"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const BalanceSheet = lazy(() => import("@/pages/BalanceSheet"));
const ProfitAndLoss = lazy(() => import("@/pages/ProfitAndLoss"));
const Cashflow = lazy(() => import("@/pages/Cashflow"));
const ChartOfAccounts = lazy(() => import("@/pages/ChartOfAccounts"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-[calc(100vh-80px)]">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
    <span className="ml-2">Loading page...</span>
  </div>
);

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
        <Route element={<DashboardLayout />}>
          <Route 
            index 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Index />
              </Suspense>
            } 
          />
          
          {/* Loans Management */}
          <Route path="loans">
            <Route 
              path="view" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Loans />
                </Suspense>
              } 
            />
            <Route 
              path="add" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <AddLoan />
                </Suspense>
              } 
            />
            <Route 
              path="bulk" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <BulkLoans />
                </Suspense>
              } 
            />
          </Route>
          
          {/* Borrowers Management */}
          <Route path="borrowers">
            <Route 
              index 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Borrowers />
                </Suspense>
              } 
            />
            <Route 
              path="bulk" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <BulkBorrowers />
                </Suspense>
              } 
            />
          </Route>
          
          {/* Applications */}
          <Route 
            path="applications" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Applications />
              </Suspense>
            } 
          />
          
          {/* Repayments */}
          <Route path="repayments">
            <Route 
              index 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Repayments />
                </Suspense>
              } 
            />
            <Route 
              path="bulk" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <BulkRepayments />
                </Suspense>
              } 
            />
          </Route>
          
          {/* Recoveries */}
          <Route path="recoveries">
            <Route 
              index 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Recoveries />
                </Suspense>
              } 
            />
            <Route 
              path="loans-in-arrears" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <LoansInArrears />
                </Suspense>
              } 
            />
            <Route 
              path="missed-payments" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <MissedPayments />
                </Suspense>
              } 
            />
            <Route 
              path="partial-payments" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <PartialPayments />
                </Suspense>
              } 
            />
          </Route>
          
          {/* Users */}
          <Route 
            path="users" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Users />
              </Suspense>
            } 
          />
          
          {/* Analytics */}
          <Route 
            path="analytics" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Analytics />
              </Suspense>
            } 
          />
          
          {/* Accounting */}
          <Route path="accounting">
            <Route 
              path="balance-sheet" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <BalanceSheet />
                </Suspense>
              } 
            />
            <Route 
              path="profit-loss" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ProfitAndLoss />
                </Suspense>
              } 
            />
            <Route 
              path="cashflow" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Cashflow />
                </Suspense>
              } 
            />
            <Route 
              path="chart-of-accounts" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ChartOfAccounts />
                </Suspense>
              } 
            />
          </Route>
          
          {/* Catch-all: Redirect to dashboard index */}
          <Route 
            path="*" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Index />
              </Suspense>
            } 
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;

// Named export for App.tsx
export const adminRoutes = <AdminRoutes />;
