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
  
  console.log("ProtectedRoute: Checking authorization");
  console.log("ProtectedRoute: User:", user);
  console.log("ProtectedRoute: User role:", user?.role);
  console.log("ProtectedRoute: Allowed roles:", allowedRoles);

  // Check if the user needs to set a password
  useEffect(() => {
    const checkPasswordStatus = async () => {
      if (!user) return;
      
      try {
        console.log("ProtectedRoute: Checking password status for user:", user.user_id);
        
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('is_password_changed')
          .eq('user_id', user.user_id)
          .single();
          
        if (error) {
          console.error("Error checking password status:", error);
          return;
        }
        
        console.log("ProtectedRoute: Password status check result:", profile);
        
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
    console.log("ProtectedRoute: Redirecting to:", redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  console.log("ProtectedRoute: User authorized, proceeding with role:", user.role);
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
