
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthHeader } from "./AuthHeader";
import { LoginForm } from "./LoginForm";
import { Loader2 } from "lucide-react";

const AuthForm = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Handle redirection based on user state
  useEffect(() => {
    if (loading) return;
    
    if (user) {
      console.log("AuthForm: User authenticated, checking status...");
      
      // First-time login check
      if (user.is_password_changed === false) {
        console.log("AuthForm: First login detected, redirecting to set-password");
        navigate('/set-password', { replace: true });
        return;
      }
      
      // Direct to appropriate dashboard
      const redirectPath = user.role === 'client' ? '/client' : '/admin';
      console.log(`AuthForm: User already logged in, redirecting to ${redirectPath}`);
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <span className="ml-2">Authenticating...</span>
      </div>
    );
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
