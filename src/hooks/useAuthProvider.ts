
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signInWithEmailAndPassword, signOut, fetchUserProfile } from "@/services/authService";
import { useAuthState } from "@/hooks/useAuthState";
import { UserProfile } from "@/types/auth";
import { supabase } from "@/lib/supabase";

export function useAuthProvider() {
  const navigate = useNavigate();
  const { user, loading, setUser, setLoading } = useAuthState();
  
  useEffect(() => {
    console.log("useAuthProvider: User state changed:", user);
  }, [user]);
  
  // Auto-login for development
  useEffect(() => {
    const isDevelopment = import.meta.env.VITE_DEV_MODE === "true";
    
    if (isDevelopment && !user && !loading) {
      console.log("useAuthProvider: Development mode - setting mock user");
      // Set a mock admin user for development
      const mockUser: UserProfile = {
        user_id: "dev-user-id",
        id: "dev-user-id",
        email: "admin@example.com",
        role: "administrator",
        first_name: "Admin",
        last_name: "User",
        created_at: new Date().toISOString(),
        is_password_changed: true,
      };
      
      setUser(mockUser);
    }
  }, [user, loading, setUser]);
  
  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("AuthProvider: Starting sign in process with:", email);
      const userData = await signInWithEmailAndPassword(email, password);
      
      if (userData) {
        console.log("AuthProvider: Sign in successful, user data:", userData);
        console.log("AuthProvider: User role:", userData.role);
        
        const userProfile: UserProfile = {
          user_id: userData.user_id,
          id: userData.user_id,
          email: userData.email,
          role: userData.role as UserProfile['role'],
          first_name: userData.first_name,
          last_name: userData.last_name,
          created_at: new Date().toISOString(),
          is_password_changed: userData.is_password_changed,
        };
        
        setUser(userProfile);
        console.log("AuthProvider: User state updated with formatted profile:", userProfile);
        
        if (userData.is_password_changed === false) {
          console.log("AuthProvider: User needs to set password");
          navigate('/set-password');
        } else {
          console.log("AuthProvider: Redirecting based on role:", userProfile.role);
          if (userProfile.role === 'client') {
            navigate('/client');
          } else {
            navigate('/admin');
          }
        }
      } else {
        console.error("AuthProvider: Sign in returned no user data");
      }
      
      return userData as unknown as UserProfile;
    } catch (error: any) {
      console.error("AuthProvider: Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
      console.log("AuthProvider: User signed out, user state cleared");
      navigate('/login');
    } catch (error: any) {
      console.error("AuthProvider: Logout error:", error);
      toast.error(error.message || "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };
  
  const sendPasswordResetEmail = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/set-password`,
      });
      
      if (error) throw error;
      
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send password reset email");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const sendVerificationEmail = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/set-password`,
        },
      });
      
      if (error) throw error;
      
      toast.success("Verification email sent. Please check your inbox.");
    } catch (error: any) {
      console.error("Verification email error:", error);
      toast.error(error.message || "Failed to send verification email");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    sendPasswordResetEmail,
    sendVerificationEmail
  };
}
