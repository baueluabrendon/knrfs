
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import ClientLayout from "@/components/client/ClientLayout";
import ClientDashboard from "@/pages/client/ClientDashboard";
import ClientLoans from "@/pages/client/ClientLoans";
import LoanApplicationSteps from "@/components/loan/LoanApplicationSteps";
import ApplicationStatus from "@/pages/client/ApplicationStatus";
import ClientRepayments from "@/pages/client/ClientRepayments";
import ClientProfile from "@/pages/client/ClientProfile";
import ClientSupport from "@/pages/client/ClientSupport";

const ClientRoutes = () => {
  return (
    <Routes>
      <Route 
        element={
          <ProtectedRoute allowedRoles={["client"]} />
        }
      >
        <Route 
          path="/client"
          element={<ClientLayout />}
        >
          <Route index element={<ClientDashboard />} />
          <Route path="loans" element={<ClientLoans />} />
          <Route path="apply" element={<LoanApplicationSteps />} />
          <Route path="status" element={<ApplicationStatus />} />
          <Route path="repayments" element={<ClientRepayments />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="support" element={<ClientSupport />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default ClientRoutes;

// Named export for App.tsx
export const clientRoutes = <ClientRoutes />;
