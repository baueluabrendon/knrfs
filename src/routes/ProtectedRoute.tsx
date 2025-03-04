
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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

  // Check if the user needs to set a password
  useEffect(() => {
    const checkPasswordStatus = async () => {
      if (!user) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('is_password_changed')
          .eq('user_id', user.user_id)
          .single();
          
        if (error) {
          console.error("Error checking password status:", error);
          return;
        }
        
        if (profile && profile.is_password_changed === false) {
          console.log("ProtectedRoute: User needs to set password");
          window.location.href = '/set-password';
        }
      } catch (error) {
        console.error("Error in password check:", error);
      }
    };
    
    if (user) {
      checkPasswordStatus();
    }
  }, [user]);

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
    console.log("ProtectedRoute: Allowed roles:", allowedRoles);
    // Redirect client to client route, others to admin route
    const redirectPath = user.role === 'client' ? '/client' : '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  console.log("ProtectedRoute: User authorized, proceeding");
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
