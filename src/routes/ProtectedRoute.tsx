
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const isDevelopment = process.env.NODE_ENV === 'development';

  console.log("ProtectedRoute - Current user:", user);
  console.log("ProtectedRoute - Allowed roles:", allowedRoles);
  console.log("ProtectedRoute - Is loading:", loading);

  // Show loading state
  if (loading) {
    console.log("ProtectedRoute - Still loading user data");
    return <div className="flex h-screen items-center justify-center">
      <div className="text-xl font-semibold">Loading authentication details...</div>
    </div>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log("ProtectedRoute - User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("ProtectedRoute - User role not allowed:", user.role, "Required roles:", allowedRoles);
    // Redirect based on role
    if (user.role === 'client') {
      console.log("ProtectedRoute - Redirecting to client dashboard");
      return <Navigate to="/client" replace />;
    } else {
      console.log("ProtectedRoute - Redirecting to admin dashboard");
      return <Navigate to="/admin" replace />;
    }
  }

  console.log("ProtectedRoute - Access granted to:", user.role);
  // Allow access
  return <>{children}</>;
};
