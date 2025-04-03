
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children?: ReactNode;
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <span className="ml-2">Verifying access...</span>
      </div>
    );
  }

  // No user -> redirect to login
  if (!user) {
    console.log("ProtectedRoute: No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User needs to set password -> redirect to password setup
  if (user.is_password_changed === false) {
    console.log("ProtectedRoute: User needs to set password");
    return <Navigate to="/set-password" replace />;
  }
  
  // User role not allowed -> redirect to appropriate dashboard
  if (!allowedRoles.includes(user.role)) {
    console.log("ProtectedRoute: User role not allowed:", user.role);
    const path = user.role === 'client' ? '/client' : '/admin';
    console.log("ProtectedRoute: Redirecting to:", path);
    return <Navigate to={path} replace />;
  }

  // Render children or outlet
  return children ? <>{children}</> : <Outlet />;
};
