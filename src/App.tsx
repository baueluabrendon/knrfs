
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import { adminRoutes } from "./routes/adminRoutes";
import { clientRoutes } from "./routes/clientRoutes";
import LoanApplicationSteps from "@/components/loan/LoanApplicationSteps";
import ProtectedRoute from "./routes/ProtectedRoute";
import SetPassword from "./pages/SetPassword";
import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Component to handle the redirect
const RedirectToLogin = () => {
  const { redirectToLogin } = useAuth();
  
  useEffect(() => {
    redirectToLogin();
  }, [redirectToLogin]);
  
  return null;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Redirect root to login page */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              {/* Authentication & Verification */}
              <Route path="/login" element={<AuthForm />} />
              <Route path="/set-password" element={<SetPassword />} />
              <Route path="/apply" element={<LoanApplicationSteps />} />
              
              {/* Force redirect to login */}
              <Route path="/reload-to-login" element={<RedirectToLogin />} />

              {/* Client Routes - Protected */}
              <Route
                path="/client/*"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    {clientRoutes}
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes - Protected */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "administrator",
                      "super_user",
                      "sales_officer",
                      "accounts_officer",
                      "recoveries_officer",
                    ]}
                  >
                    {adminRoutes}
                  </ProtectedRoute>
                }
              />

              {/* Catch-all: Redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
