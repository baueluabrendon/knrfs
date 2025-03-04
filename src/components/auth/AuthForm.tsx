
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthHeader } from "./AuthHeader";
import { LoginForm } from "./LoginForm";

const AuthForm = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isDevelopment = import.meta.env.VITE_DEV_MODE === "true";

  useEffect(() => {
    console.log("AuthForm: Component mounted");
    
    // Only handle redirects when loading is complete
    if (!loading) {
      if (user) {
        console.log("AuthForm: User already logged in, redirecting...", user);
        
        // Redirect based on user role
        if (user.role === 'client') {
          navigate('/client', { replace: true });
        } else {
          navigate('/admin', { replace: true });
        }
      } else if (isDevelopment) {
        // In development mode, automatically redirect to admin
        console.log("AuthForm: Development mode - redirecting to admin dashboard");
        navigate('/admin', { replace: true });
      }
    }
  }, [user, navigate, loading, isDevelopment]);

  // Don't render the form at all if we're redirecting
  if (loading || (user !== null) || isDevelopment) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <div className="flex-1 flex items-center justify-center bg-white">
        <LoginForm />
      </div>
    </div>
  );
};

export default AuthForm;
