
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: ReactNode;
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isDevelopment = import.meta.env.VITE_DEV_MODE === "true";

  useEffect(() => {
    if (isDevelopment) return; // Skip protection in development mode

    if (!loading) {
      if (!user) {
        navigate("/login", { replace: true });
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.log("User role not allowed:", user.role);
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, navigate, allowedRoles, isDevelopment]);

  if (isDevelopment) {
    return children ? <>{children}</> : <Outlet />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return children ? <>{children}</> : <Outlet />;
};
