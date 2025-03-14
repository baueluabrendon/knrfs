
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { UserProfile } from "@/types/auth";
import { supabase } from "@/lib/supabase";
import * as authService from "@/services/authService";

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export function useAuthProvider() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // Check for existing session on component mount
  useEffect(() => {
    const checkCurrentSession = async () => {
      try {
        console.log("useAuthProvider: Checking current session");
        
        const sessionData = await authService.checkExistingSession();
        
        if (sessionData) {
          const { userProfile } = sessionData;
          console.log("useAuthProvider: Successfully retrieved profile:", userProfile);
          setAuthState(prev => ({ ...prev, user: userProfile, loading: false }));
        } else {
          console.log("useAuthProvider: No active session found");
          setAuthState(prev => ({ ...prev, user: null, loading: false }));
        }
      } catch (error) {
        console.error("useAuthProvider: Error checking session:", error);
        setAuthState(prev => ({ ...prev, user: null, loading: false }));
      }
    };
    
    checkCurrentSession();
    
    // Set up auth state listener
    const subscription = authService.setupAuthListener((userProfile) => {
      if (userProfile) {
        console.log("useAuthProvider: Auth state updated with user:", userProfile);
        setAuthState(prev => ({ ...prev, user: userProfile, loading: false }));
      } else {
        console.log("useAuthProvider: Auth state updated with no user");
        setAuthState(prev => ({ ...prev, user: null, loading: false }));
      }
    });
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleSignIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      console.log("AuthProvider: Starting sign in process with:", email);
      
      const userProfile = await authService.signIn(email, password);
      
      console.log("AuthProvider: Setting user state with profile:", userProfile);
      setAuthState(prev => ({ ...prev, user: userProfile, loading: false, error: null }));
      
      console.log("AuthProvider: Login successful, returning user profile");
      return userProfile;
    } catch (error: any) {
      console.error("AuthProvider: Login error:", error);
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      await authService.signOut();
      setAuthState({ user: null, loading: false, error: null });
      console.log("AuthProvider: User signed out, user state cleared");
    } catch (error: any) {
      console.error("AuthProvider: Logout error:", error);
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
      toast.error(error.message || "Failed to sign out");
    }
  };
  
  const sendPasswordResetEmail = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      await authService.sendPasswordResetEmail(email);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      console.error("Password reset error:", error);
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };
  
  const sendVerificationEmail = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/set-password`,
        },
      });
      
      if (error) throw error;
      
      toast.success("Verification email sent. Please check your inbox.");
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      console.error("Verification email error:", error);
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
      toast.error(error.message || "Failed to send verification email");
      throw error;
    }
  };

  return {
    authState,
    signIn: handleSignIn,
    signOut: handleSignOut,
    sendPasswordResetEmail,
    sendVerificationEmail
  };
}
