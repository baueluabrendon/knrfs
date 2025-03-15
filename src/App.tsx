
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
import { ProtectedRoute } from "./routes/ProtectedRoute";
import SetPassword from "./pages/SetPassword";

// Create a new QueryClient instance
const queryClient = new QueryClient();

const App = () => {
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
              
              {/* Public loan application */}
              <Route 
                path="/apply" 
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <LoanApplicationSteps />
                  </ProtectedRoute>
                } 
              />

              {/* Client Routes */}
              {clientRoutes}

              {/* Admin Routes */}
              {adminRoutes}

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
