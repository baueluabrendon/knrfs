
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthHeader } from "./AuthHeader";
import { LoginForm } from "./LoginForm";
import { Loader2 } from "lucide-react";

const AuthForm = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Only handle redirection for authenticated users
  useEffect(() => {
    if (loading || !user) return;
    
    // Use the same redirection logic as in ProtectedRoute
    if (user.is_password_changed === false) {
      navigate('/set-password', { replace: true });
      return;
    }
    
    const redirectPath = user.role === 'client' ? '/client' : '/admin';
    navigate(redirectPath, { replace: true });
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
