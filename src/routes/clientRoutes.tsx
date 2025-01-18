import { Route } from "react-router-dom";
import { ClientRoute } from "./ClientRoute";
import ClientLayout from "@/components/client/ClientLayout";
import ClientDashboard from "@/pages/client/ClientDashboard";
import ClientLoans from "@/pages/client/ClientLoans";

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
  </Route>
);