
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { UserProfile } from "@/types/auth";
import { supabase } from "@/lib/supabase";

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
        
        // Get auth session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session retrieval error:", sessionError);
          setAuthState(prev => ({ ...prev, user: null, loading: false }));
          return;
        }
        
        if (!session?.user) {
          console.log("useAuthProvider: No active session found");
          setAuthState(prev => ({ ...prev, user: null, loading: false }));
          return;
        }

        console.log("useAuthProvider: Found existing session for user:", session.user.id);
        
        // Fetch user profile with a simple direct query
        try {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('user_id, email, role, first_name, last_name, is_password_changed')
            .eq('user_id', session.user.id)
            .single();
          
          if (profileError) {
            console.error("Error fetching user profile:", profileError);
            setAuthState(prev => ({ ...prev, user: null, loading: false }));
            return;
          }
          
          if (profile) {
            console.log("useAuthProvider: Successfully retrieved profile:", profile);
            
            const userProfile: UserProfile = {
              user_id: profile.user_id,
              id: profile.user_id,
              email: profile.email,
              role: profile.role as UserProfile['role'],
              first_name: profile.first_name,
              last_name: profile.last_name,
              created_at: new Date().toISOString(),
              is_password_changed: profile.is_password_changed,
            };
            
            setAuthState(prev => ({ ...prev, user: userProfile, loading: false }));
          } else {
            console.log("useAuthProvider: No profile found for user session");
            setAuthState(prev => ({ ...prev, user: null, loading: false }));
          }
        } catch (profileError) {
          console.error("Profile fetch error:", profileError);
          setAuthState(prev => ({ ...prev, user: null, loading: false }));
        }
      } catch (error) {
        console.error("useAuthProvider: Error checking session:", error);
        setAuthState(prev => ({ ...prev, user: null, loading: false }));
      }
    };
    
    checkCurrentSession();
  }, []);
  
  const handleSignIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      console.log("AuthProvider: Starting sign in process with:", email);
      
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Supabase auth error:", error);
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        throw error;
      }

      if (!data.user) {
        const errorMsg = "No user returned from authentication";
        console.error(errorMsg);
        setAuthState(prev => ({ ...prev, loading: false, error: errorMsg }));
        throw new Error(errorMsg);
      }
      
      console.log("Supabase auth successful:", data);
      
      // Fetch user profile with simple query
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id, email, role, first_name, last_name, is_password_changed')
        .eq('user_id', data.user.id)
        .single();
      
      console.log("Profile query response:", { profile, error: profileError });
        
      if (profileError) {
        console.error("Error fetching user profile after login:", profileError);
        setAuthState(prev => ({ ...prev, loading: false, error: "Failed to retrieve user profile. This might be due to a permission issue." }));
        throw new Error("Failed to retrieve user profile. This might be due to a permission issue.");
      }
      
      if (!profile) {
        const errorMsg = "User profile not found. Please contact support.";
        console.error(errorMsg);
        setAuthState(prev => ({ ...prev, loading: false, error: errorMsg }));
        throw new Error(errorMsg);
      }
      
      // Create user profile object
      const userProfile: UserProfile = {
        user_id: profile.user_id,
        id: profile.user_id,
        email: profile.email,
        role: profile.role as UserProfile['role'],
        first_name: profile.first_name,
        last_name: profile.last_name,
        created_at: new Date().toISOString(),
        is_password_changed: profile.is_password_changed,
      };
      
      console.log("AuthProvider: Setting user state with profile:", userProfile);
      setAuthState(prev => ({ ...prev, user: userProfile, loading: false, error: null }));
      
      console.log("AuthProvider: Login successful, returning user profile");
      return userProfile;
    } catch (error: any) {
      console.error("AuthProvider: Login error:", error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      await supabase.auth.signOut();
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/set-password`,
      });
      
      if (error) throw error;
      
      toast.success("Password reset email sent. Please check your inbox.");
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      console.error("Password reset error:", error);
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
      toast.error(error.message || "Failed to send password reset email");
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
