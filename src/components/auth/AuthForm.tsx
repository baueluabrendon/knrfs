import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthHeader } from "./AuthHeader";
import { LoginForm } from "./LoginForm";

const AuthForm = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AuthForm: Component mounted");
    
    // Only handle redirects when loading is complete and user is authenticated
    if (!loading && user) {
      console.log("AuthForm: User already logged in, redirecting...", user);
      
      // Redirect based on user role
      if (user.role === 'client') {
        navigate('/client', { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
    }
  }, [user, navigate, loading]);

  // Show loading indicator only while authentication state is being determined
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
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
