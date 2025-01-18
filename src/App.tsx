import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Users from "./pages/Users";
import Applications from "./pages/Applications";
import Loans from "./pages/Loans";
import AddLoan from "./pages/AddLoan";
import BulkLoans from "./pages/BulkLoans";
import Borrowers from "./pages/Borrowers";
import BulkBorrowers from "./pages/BulkBorrowers";
import Repayments from "./pages/Repayments";
import LoansInArrears from "./pages/LoansInArrears";
import MissedPayments from "./pages/MissedPayments";
import PartialPayments from "./pages/PartialPayments";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import BalanceSheet from "./pages/BalanceSheet";
import ProfitAndLoss from "./pages/ProfitAndLoss";
import Cashflow from "./pages/Cashflow";
import Analytics from "./pages/Analytics";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

// Client Route Component
const ClientRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'CLIENT') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "SALES_OFFICER", "ACCOUNTS_OFFICER", "RECOVERIES_OFFICER", "OFFICE_ADMIN"]}>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER"]}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER"]}>
                  <Applications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "SALES_OFFICER"]}>
                  <Loans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans/add"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "SALES_OFFICER"]}>
                  <AddLoan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans/bulk"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "SALES_OFFICER"]}>
                  <BulkLoans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/borrowers"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "SALES_OFFICER"]}>
                  <Borrowers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/borrowers/bulk"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "SALES_OFFICER"]}>
                  <BulkBorrowers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/repayments"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "ACCOUNTS_OFFICER"]}>
                  <Repayments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recoveries/arrears"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "RECOVERIES_OFFICER"]}>
                  <LoansInArrears />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recoveries/missed"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "RECOVERIES_OFFICER"]}>
                  <MissedPayments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recoveries/partial"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "RECOVERIES_OFFICER"]}>
                  <PartialPayments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting/chart-of-accounts"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "ACCOUNTS_OFFICER"]}>
                  <ChartOfAccounts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting/balance-sheet"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "ACCOUNTS_OFFICER"]}>
                  <BalanceSheet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting/profit-loss"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "ACCOUNTS_OFFICER"]}>
                  <ProfitAndLoss />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting/cashflow"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER", "ACCOUNTS_OFFICER"]}>
                  <Cashflow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={["SUPER_USER", "MANAGER"]}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            
            {/* Client Routes - To be implemented */}
            <Route
              path="/client/*"
              element={
                <ClientRoute>
                  {/* Client portal components will go here */}
                </ClientRoute>
              }
            />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
