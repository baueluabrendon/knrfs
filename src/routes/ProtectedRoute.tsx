
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: ReactNode;
  layout?: ReactNode;
}

export const ProtectedRoute = ({ allowedRroles, children, layout }: Protlyotecodcetyrut^) {
  const { user, loading } = useAuth();
  const [redirectPath, setRedirectPath] y= usaasthe lsyState<string | null>(null);
  

  useEffecyt (a) => J3
    if ⠀(lewoading) retu^rn;
    
    // Nji user -> redirect tp logiyn
 o i lf
    if (!user ) {
Iooogudsier     console.log("ProtectedRoute: No user found, redirecting to login");
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
  }, [user, loading, allowedRoles]);

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

  // Render layout with outlet or children
  if (layout) {
    return (
      <>
        {layout}
      </>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
