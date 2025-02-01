import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AuthHeader } from "./AuthHeader";
import { LoginForm } from "./LoginForm";

const AuthForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    if (user.role === 'client') {
      navigate('/client');
    } else {
      navigate('/admin');
    }
    return null;
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