
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ClientRouteProps {
  children: React.ReactNode;
}

export const ClientRoute = ({ children }: ClientRouteProps) => {
  const { user, loading } = useAuth();
  const isDevelopment = import.meta.env.VITE_DEV_MODE === "true";

  // Allow access in development mode
  if (isDevelopment) {
    console.log("Development mode: bypassing client authentication");
    return <>{children}</>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'client') {
    console.log("User is not a client, redirecting to appropriate dashboard");
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
