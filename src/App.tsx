
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  createBrowserRouter, 
  RouterProvider, 
  Navigate, 
  RouteObject,
  Outlet
} from "react-router-dom";
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

// Create routes array
const routes: RouteObject[] = [
  // Authentication & Verification
  {
    path: "/",
    element: <div><Outlet /></div>,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />
      },
      {
        path: "login",
        element: <AuthForm />,
      },
      {
        path: "set-password",
        element: <SetPassword />,
      }
    ]
  },
  
  // Public loan application
  {
    path: "/apply",
    element: <LoanApplicationSteps />,
  },

  // Client Routes with protection
  {
    element: <ProtectedRoute allowedRoles={clientRoles} />,
    children: clientRoutes,
  },

  // Admin Routes with protection
  {
    element: <ProtectedRoute allowedRoles={adminRoles} />,
    children: adminRoutes,
  },

  // Catch-all: Redirect to login
  {
    path: "*",
    element: <Navigate to="/login" replace />
  }
];

// Create router with routes
const router = createBrowserRouter(routes);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
