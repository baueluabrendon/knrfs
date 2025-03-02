
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthHeader } from "./AuthHeader";
import { LoginForm } from "./LoginForm";

const AuthForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AuthForm: Component mounted");
    console.log("AuthForm: Current user:", user);
    
    // Redirect if already logged in
    if (user) {
      console.log("AuthForm: User already logged in, redirecting...", user);
      
      if (user.role === 'client') {
        console.log("AuthForm: Redirecting to /client");
        navigate('/client');
      } else {
        console.log("AuthForm: Redirecting to /admin with role:", user.role);
        navigate('/admin');
      }
    }
  }, [user, navigate]);

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
