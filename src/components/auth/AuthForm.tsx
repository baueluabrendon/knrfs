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
    if (!loading && user && !isRedirecting) {
      console.log("AuthForm: User already logged in, redirecting...", user);
      setIsRedirecting(true);
      
      if (user.role === 'client') {
        navigate('/client', { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
    }
  }, [user, navigate, loading, isRedirecting]);

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
