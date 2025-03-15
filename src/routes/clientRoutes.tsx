
import { RouteProps } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import ClientLayout from "@/components/client/ClientLayout";

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

export const clientRoutes: AppRoute[] = [
  {
    path: "/client",
    element: (
      <ProtectedRoute allowedRoles={["client"]}>
        <ClientLayout>
          <ClientDashboard />
        </ClientLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/client/loans",
    element: (
      <ProtectedRoute allowedRoles={["client"]}>
        <ClientLayout>
          <ClientLoans />
        </ClientLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/client/repayments",
    element: (
      <ProtectedRoute allowedRoles={["client"]}>
        <ClientLayout>
          <ClientRepayments />
        </ClientLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/client/profile",
    element: (
      <ProtectedRoute allowedRoles={["client"]}>
        <ClientLayout>
          <ClientProfile />
        </ClientLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/client/support",
    element: (
      <ProtectedRoute allowedRoles={["client"]}>
        <ClientLayout>
          <ClientSupport />
        </ClientLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/client/applications",
    element: (
      <ProtectedRoute allowedRoles={["client"]}>
        <ClientLayout>
          <ApplicationStatus />
        </ClientLayout>
      </ProtectedRoute>
    ),
  },
];
