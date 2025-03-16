
import { RouteProps } from "react-router-dom";
import ClientDashboard from "@/pages/client/ClientDashboard";
import ClientLoans from "@/pages/client/ClientLoans";
import ClientRepayments from "@/pages/client/ClientRepayments";
import ClientProfile from "@/pages/client/ClientProfile";
import ClientSupport from "@/pages/client/ClientSupport";
import ApplicationStatus from "@/pages/client/ApplicationStatus";

// Define routes as an array of objects with path and element properties
interface AppRoute extends Omit<RouteProps, 'element'> {
  path: string;
  element: React.ReactNode;
}

// Client routes without ProtectedRoute wrapper - will be applied in App.tsx
export const clientRoutes: AppRoute[] = [
  {
    path: "/client",
    element: <ClientDashboard />
  },
  {
    path: "/client/loans",
    element: <ClientLoans />
  },
  {
    path: "/client/repayments",
    element: <ClientRepayments />
  },
  {
    path: "/client/profile",
    element: <ClientProfile />
  },
  {
    path: "/client/support",
    element: <ClientSupport />
  },
  {
    path: "/client/applications",
    element: <ApplicationStatus />
  },
];
