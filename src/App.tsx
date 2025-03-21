
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import SetPassword from "./pages/SetPassword";
import LoanApplicationSteps from "@/components/loan/LoanApplicationSteps";

// Import the routes
import { adminRoutes } from "./routes/adminRoutes";
import { clientRoutes } from "./routes/clientRoutes";

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
              
              {/* Public loan application */}
              <Route path="/apply" element={<LoanApplicationSteps />} />

              {/* Client Routes with protection */}
              <Route element={<ProtectedRoute allowedRoles={clientRoles} />}>
                {clientRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  >
                    {route.children?.map((childRoute) => (
                      <Route
                        key={childRoute.path || 'index'}
                        path={childRoute.path}
                        element={childRoute.element}
                        index={childRoute.index}
                      />
                    ))}
                  </Route>
                ))}
              </Route>

              {/* Admin Routes with protection */}
              <Route element={<ProtectedRoute allowedRoles={adminRoles} />}>
                {adminRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  >
                    {route.children?.map((childRoute) => (
                      <Route
                        key={childRoute.path || 'index'}
                        path={childRoute.path}
                        element={childRoute.element}
                        index={childRoute.index}
                      />
                    ))}
                  </Route>
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
