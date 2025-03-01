
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import { adminRoutes } from "./routes/adminRoutes";
import { clientRoutes } from "./routes/clientRoutes";
import { useAuth } from "@/contexts/AuthContext";
import LoanApplicationSteps from "@/components/loan/LoanApplicationSteps";
import { ProtectedRoute } from "./routes/ProtectedRoute";

const queryClient = new QueryClient();

const AuthWrapper = () => {
  const { user, loading } = useAuth();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // During development, redirect to admin dashboard
  if (isDevelopment) {
    console.log("Development mode: redirecting to admin dashboard");
    return <Navigate to="/admin" replace />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route based on user role
  switch (user.role) {
    case 'client':
      return <Navigate to="/client" replace />;
    case 'administrator':
    case 'super user':
    case 'sales officer':
    case 'accounts officer':
    case 'recoveries officer':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<AuthWrapper />} />
            <Route path="/login" element={<AuthForm />} />
            <Route path="/apply" element={<LoanApplicationSteps />} />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={adminRoutes} />

            {/* Client Routes */}
            <Route path="/client/*" element={clientRoutes} />

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
