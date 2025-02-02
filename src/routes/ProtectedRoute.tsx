import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Allow access in development mode
  if (isDevelopment) {
    return <>{children}</>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("User role not allowed:", user.role); // Debug log
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};