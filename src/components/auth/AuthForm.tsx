
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthHeader } from "./AuthHeader";
import { LoginForm } from "./LoginForm";
import { Loader2 } from "lucide-react";

const AuthForm = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    console.log("AuthForm: Component mounted");
    console.log("AuthForm: Current loading state:", loading);
    console.log("AuthForm: Current user state:", user);
    
    // Only handle redirects when loading is complete and user is authenticated
    if (!loading && user && !isRedirecting) {
      console.log("AuthForm: User already logged in, redirecting...", user);
      setIsRedirecting(true);
      
      // Redirect based on user role
      if (user.role === 'client') {
        console.log("AuthForm: Redirecting to client dashboard");
        navigate('/client', { replace: true });
      } else {
        console.log("AuthForm: Redirecting to admin dashboard");
        navigate('/admin', { replace: true });
      }
    }
  }, [user, navigate, loading, isRedirecting]);

  // Show loading indicator only while authentication state is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <span className="ml-2">Authenticating...</span>
      </div>
    );
  }

  // If user is already logged in, we'll redirect (handled in useEffect)
  // Otherwise, show the login form
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
