
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import SetPassword from "./pages/SetPassword";
import LoanApplicationSteps from "@/components/loan/LoanApplicationSteps";

// Import the routes and layouts
import { adminRoutes } from "./routes/adminRoutes";
import { clientRoutes } from "./routes/clientRoutes";
import DashboardLayout from "@/components/DashboardLayout";
import ClientLayout from "@/components/client/ClientLayout";

// Define the admin roles array
const adminRoles = ["administrator", "super user", "sales officer", "accounts officer", "administration officer", "recoveries officer"];
// Define the client roles array
const clientRoles = ["client"];

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
              
              {/* Public loan application - No longer wrapped in ProtectedRoute */}
              <Route path="/apply" element={<LoanApplicationSteps />} />

              {/* Client Routes - Wrapped in ClientLayout with ProtectedRoute */}
              <Route
                path="/client"
                element={
                  <ProtectedRoute 
                    allowedRoles={clientRoles} 
                    layout={
                      <ClientLayout>
                        <Outlet />
                      </ClientLayout>
                    }
                  />
                }
              >
                {clientRoutes.map((route) => (
                  <Route key={route.path} path={route.path === "/client" ? "" : route.path.replace("/client", "")} element={route.element} />
                ))}
              </Route>

              {/* Admin Routes - Wrapped in DashboardLayout with ProtectedRoute */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute 
                    allowedRoles={adminRoles} 
                    layout={
                      <DashboardLayout>
                        <Outlet />
                      </DashboardLayout>
                    }
                  />
                }
              >
                {adminRoutes.map((route) => (
                  <Route key={route.path} path={route.path === "/admin" ? "" : route.path.replace("/admin", "")} element={route.element} />
                ))}
              </Route>

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
