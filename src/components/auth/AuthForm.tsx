
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
    console.log("AuthForm: Current user:", user);
    console.log("AuthForm: Loading state:", loading);
    console.log("AuthForm: Development mode:", isDevelopment);
    
    // Redirect if already logged in
    if (user) {
      console.log("AuthForm: User already logged in, redirecting...", user);
      console.log("AuthForm: User role:", user.role);
      
      if (user.role === 'client') {
        console.log("AuthForm: Redirecting to /client");
        navigate('/client', { replace: true });
      } else {
        console.log("AuthForm: Redirecting to /admin with role:", user.role);
        navigate('/admin', { replace: true });
      }
    } else if (isDevelopment) {
      // In development mode, automatically redirect to admin
      console.log("AuthForm: Development mode - redirecting to admin dashboard");
      navigate('/admin', { replace: true });
    }
  }, [user, navigate, loading, isDevelopment]);

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
