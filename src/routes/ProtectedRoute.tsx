
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode, useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: ReactNode;
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const checkAttempted = useRef(false);
  
  console.log("ProtectedRoute: Checking authorization");
  console.log("ProtectedRoute: User:", user);
  console.log("ProtectedRoute: User role:", user?.role);
  console.log("ProtectedRoute: Allowed roles:", allowedRoles);

  // Single effect to handle all authorization checks to avoid multiple re-renders
  useEffect(() => {
    // Skip if still loading, already checked, or redirect already set
    if (loading || redirectPath !== null || checkAttempted.current) return;
    
    checkAttempted.current = true;
    
    // No user -> redirect to login
    if (!user) {
      console.log("ProtectedRoute: No user found, redirecting to login");
      setRedirectPath('/login');
      return;
    }
    
    // User needs to set password -> redirect to password setup
    if (user.is_password_changed === false) {
      console.log("ProtectedRoute: User needs to set password");
      setRedirectPath('/set-password');
      return;
    }
    
    // User role not allowed -> redirect to appropriate dashboard
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      console.log("ProtectedRoute: User role not allowed:", user.role);
      const path = user.role === 'client' ? '/client' : '/admin';
      console.log("ProtectedRoute: Redirecting to:", path);
      setRedirectPath(path);
      return;
    }
  }, [user, loading, allowedRoles, redirectPath]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <span className="ml-2">Verifying access...</span>
      </div>
    );
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
