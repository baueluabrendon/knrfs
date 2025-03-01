
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Allow access in development mode if enabled
  if (isDevelopment) {
    console.log("Development mode: bypassing authentication");
    return <>{children}</>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("User role not allowed:", user.role, "Required roles:", allowedRoles);
    // Redirect based on role
    if (user.role === 'client') {
      return <Navigate to="/client" replace />;
    } else {
      return <Navigate to="/admin" replace />;
    }
  }

  // Allow access
  return <>{children}</>;
};
