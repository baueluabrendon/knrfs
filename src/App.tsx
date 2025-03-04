
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

const queryClient = new QueryClient();

const App = () => {
  const isDevelopment = import.meta.env.VITE_DEV_MODE === "true";
  console.log("App: Development mode:", isDevelopment);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Authentication & Verification */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<AuthForm />} />
              <Route path="/set-password" element={<SetPassword />} />
              <Route path="/apply" element={<LoanApplicationSteps />} />

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
