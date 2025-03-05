
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: ReactNode;
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  console.log("ProtectedRoute: Checking authorization");
  console.log("ProtectedRoute: User:", user);
  console.log("ProtectedRoute: User role:", user?.role);
  console.log("ProtectedRoute: Allowed roles:", allowedRoles);

  // Check if the user needs to set a password
  useEffect(() => {
    const checkPasswordStatus = async () => {
      if (!user || isChecking || isRedirecting) return;
      
      try {
        setIsChecking(true);
        console.log("ProtectedRoute: Checking password status for user:", user.user_id);
        
        // Use profile from context instead of fetching again if possible
        if (user.is_password_changed === false) {
          console.log("ProtectedRoute: User needs to set password (from context)");
          setIsRedirecting(true);
          window.location.href = '/set-password';
          return;
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error("Error in password check:", error);
        setIsChecking(false);
      }
    };
    
    if (user && !loading) {
      checkPasswordStatus();
    }
  }, [user, loading, isChecking, isRedirecting]);

  if (loading || isChecking) {
    console.log("ProtectedRoute: Still loading or checking user data");
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <span className="ml-2">Verifying access...</span>
      </div>
    );
  }

  if (!user && !isRedirecting) {
    console.log("ProtectedRoute: No user found, redirecting to login");
    setIsRedirecting(true);
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role) && !isRedirecting) {
    console.log("ProtectedRoute: User role not allowed:", user.role);
    console.log("ProtectedRoute: Allowed roles:", allowedRoles);
    // Redirect client to client route, others to admin route
    const redirectPath = user.role === 'client' ? '/client' : '/admin';
    console.log("ProtectedRoute: Redirecting to:", redirectPath);
    setIsRedirecting(true);
    return <Navigate to={redirectPath} replace />;
  }

  console.log("ProtectedRoute: User authorized, proceeding with role:", user?.role);
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
