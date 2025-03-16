
import { RouteObject } from "react-router-dom";
import ClientDashboard from "@/pages/client/ClientDashboard";
import ClientLoans from "@/pages/client/ClientLoans";
import ClientRepayments from "@/pages/client/ClientRepayments";
import ClientProfile from "@/pages/client/ClientProfile";
import ClientSupport from "@/pages/client/ClientSupport";
import ApplicationStatus from "@/pages/client/ApplicationStatus";
import ClientLayout from "@/components/client/ClientLayout";

// Define the client routes
export const clientRoutes: RouteObject[] = [
  {
    path: "/client",
    element: <ClientLayout />,
    children: [
      {
        index: true,
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
      }
    ]
  }
];
