
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import { adminRoutes } from "./routes/adminRoutes";
import { clientRoutes } from "./routes/clientRoutes";
import LoanApplicationSteps from "@/components/loan/LoanApplicationSteps";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AuthWrapper = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isDevelopment = import.meta.env.VITE_DEV_MODE === "true";

  console.log("AuthWrapper: Component rendered");
  console.log("AuthWrapper: User state:", user);
  console.log("AuthWrapper: Loading state:", loading);
  console.log("AuthWrapper: isDevelopment:", isDevelopment);

  useEffect(() => {
    console.log("AuthWrapper: useEffect triggered");
    console.log("AuthWrapper: Current user:", user);
    console.log("AuthWrapper: Loading state:", loading);

    if (isDevelopment) {
      console.log("AuthWrapper: Development mode, navigating to /admin");
      navigate("/admin", { replace: true });
      return;
    }

    if (!loading) {
      if (!user) {
        console.log("AuthWrapper: No user, navigating to /login");
        navigate("/login", { replace: true });
      } else if (user.role === "client") {
        console.log("AuthWrapper: User is client, navigating to /client");
        navigate("/client", { replace: true });
      } else {
        console.log("AuthWrapper: User is admin, navigating to /admin with role:", user.role);
        navigate("/admin", { replace: true });
      }
    } else {
      console.log("AuthWrapper: Still loading user data");
    }
  }, [user, loading, navigate, isDevelopment]);

  return <div>Loading...</div>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Authentication & Verification */}
            <Route path="/" element={<AuthWrapper />} />
            <Route path="/login" element={<AuthForm />} />
            <Route path="/apply" element={<LoanApplicationSteps />} />

            {/* Client Routes - Protected */}
            <Route
              path="/client/*"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <Routes>{clientRoutes.props.children}</Routes>
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
                  <Routes>{adminRoutes.props.children}</Routes>
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

export default App;
