
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ClientRouteProps {
  children: React.ReactNode;
}

export const ClientRoute = ({ children }: ClientRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <span className="ml-2">Verifying access...</span>
      </div>
    );
  }

  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (user.is_password_changed === false) {
    console.log("User needs to set password");
    return <Navigate to="/set-password" replace />;
  }

  if (user.role !== 'client') {
    console.log("User is not a client, redirecting to appropriate dashboard");
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
