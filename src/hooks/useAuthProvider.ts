
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
  
  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("AuthContext: Starting sign in process with:", email);
      const userData = await signInWithEmailAndPassword(email, password);
      
      if (userData) {
        console.log("AuthContext: Sign in successful, user data:", userData);
        console.log("AuthContext: User role:", userData.role);
        
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
        console.log("AuthContext: User state updated with formatted profile:", userProfile);
        
        if (userData.is_password_changed === false) {
          console.log("AuthContext: User needs to set password");
          navigate('/set-password');
        } else {
          if (userProfile.role === 'client') {
            navigate('/client');
          } else {
            navigate('/admin');
          }
        }
      } else {
        console.error("AuthContext: Sign in returned no user data");
      }
      
      return userData as unknown as UserProfile;
    } catch (error: any) {
      console.error("AuthContext: Login error:", error);
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
      console.log("AuthContext: User signed out, user state cleared");
      navigate('/login');
    } catch (error: any) {
      console.error("AuthContext: Logout error:", error);
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
