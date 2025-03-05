
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: ReactNode;
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState<{to: string, replace: boolean} | null>(null);
  
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
        
        // Use profile from context
        if (user.is_password_changed === false) {
          console.log("ProtectedRoute: User needs to set password");
          setIsRedirecting(true);
          setShouldRedirect({ to: '/set-password', replace: true });
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

  // Check if user is authenticated and has proper role
  useEffect(() => {
    if (loading || isChecking || isRedirecting) return;

    if (!user) {
      console.log("ProtectedRoute: No user found, redirecting to login");
      setIsRedirecting(true);
      setShouldRedirect({ to: '/login', replace: true });
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      console.log("ProtectedRoute: User role not allowed:", user.role);
      // Redirect client to client route, others to admin route
      const redirectPath = user.role === 'client' ? '/client' : '/admin';
      console.log("ProtectedRoute: Redirecting to:", redirectPath);
      setIsRedirecting(true);
      setShouldRedirect({ to: redirectPath, replace: true });
      return;
    }
  }, [user, loading, allowedRoles, isChecking, isRedirecting]);

  if (loading || isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <span className="ml-2">Verifying access...</span>
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to={shouldRedirect.to} replace={shouldRedirect.replace} />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
