import { Route } from "react-router-dom";
import { ClientRoute } from "./ClientRoute";
import ClientLayout from "@/components/client/ClientLayout";
import ClientDashboard from "@/pages/client/ClientDashboard";
import ClientLoans from "@/pages/client/ClientLoans";
import LoanApplicationSteps from "@/components/loan/LoanApplicationSteps";

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
    <Route path="status" element={<div>Application Status</div>} />
    <Route path="repayments" element={<div>Repayments</div>} />
    <Route path="profile" element={<div>Profile</div>} />
    <Route path="support" element={<div>Support</div>} />
  </Route>
);