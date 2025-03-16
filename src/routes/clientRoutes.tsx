
import { RouteProps } from "react-router-dom";
import ClientDashboard from "@/pages/client/ClientDashboard";
import ClientLoans from "@/pages/client/ClientLoans";
import ClientRepayments from "@/pages/client/ClientRepayments";
import ClientProfile from "@/pages/client/ClientProfile";
import ClientSupport from "@/pages/client/ClientSupport";
import ApplicationStatus from "@/pages/client/ApplicationStatus";
import ClientLayout from "@/components/client/ClientLayout";
import { Outlet } from "react-router-dom";

// Define routes as an array of objects with path and element properties
interface AppRoute extends Omit<RouteProps, 'element'> {
  path: string;
  element: React.ReactNode;
}

// Root client route with ClientLayout
export const clientRootRoute: AppRoute = {
  path: "/client",
  element: (
    <ClientLayout>
      <Outlet />
    </ClientLayout>
  )
};

// Client child routes without layout (will be nested)
export const clientRoutes: AppRoute[] = [
  {
    path: "", // index route
    element: <ClientDashboard />
  },
  {
    path: "loans",
    element: <ClientLoans />
  },
  {
    path: "repayments",
    element: <ClientRepayments />
  },
  {
    path: "profile",
    element: <ClientProfile />
  },
  {
    path: "support",
    element: <ClientSupport />
  },
  {
    path: "applications",
    element: <ApplicationStatus />
  },
];
