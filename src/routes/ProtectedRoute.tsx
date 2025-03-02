
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: ReactNode;
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const isDevelopment = import.meta.env.VITE_DEV_MODE === "true";
  
  console.log("ProtectedRoute: Checking authorization");
  console.log("ProtectedRoute: User:", user);
  console.log("ProtectedRoute: Allowed roles:", allowedRoles);
  console.log("ProtectedRoute: isDevelopment:", isDevelopment);

  // Allow access in development mode
  if (isDevelopment) {
    console.log("ProtectedRoute: Development mode - bypassing authentication");
    return children ? <>{children}</> : <Outlet />;
  }

  if (loading) {
    console.log("ProtectedRoute: Still loading user data");
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log("ProtectedRoute: No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("ProtectedRoute: User role not allowed:", user.role);
    // Redirect client to client route, others to admin route
    const redirectPath = user.role === 'client' ? '/client' : '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  console.log("ProtectedRoute: User authorized, proceeding");
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
