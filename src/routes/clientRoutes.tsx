import { Route } from "react-router-dom";
import { ClientRoute } from "./ClientRoute";
import ClientLayout from "@/components/client/ClientLayout";
import ClientDashboard from "@/pages/client/ClientDashboard";
import ClientLoans from "@/pages/client/ClientLoans";
import LoanApplicationSteps from "@/components/loan/LoanApplicationSteps";
import ApplicationStatus from "@/pages/client/ApplicationStatus";
import ClientRepayments from "@/pages/client/ClientRepayments";
import ClientProfile from "@/pages/client/ClientProfile";
import ClientSupport from "@/pages/client/ClientSupport";

export const clientRoutes = (
  <Route
    path="/client"
    element={
      <ClientRoute>
        <ClientLayout />
      </ClientRoute>
    }
  >
    <Route index element={<ClientDashboard />} />
    <Route path="loans" element={<ClientLoans />} />
    <Route path="apply" element={<LoanApplicationSteps />} />
    <Route path="status" element={<ApplicationStatus />} />
    <Route path="repayments" element={<ClientRepayments />} />
    <Route path="profile" element={<ClientProfile />} />
    <Route path="support" element={<ClientSupport />} />
  </Route>
);