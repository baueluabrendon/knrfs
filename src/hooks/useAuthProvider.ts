
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signInWithEmailAndPassword, signOut, fetchUserProfile } from "@/services/authService";
import { useAuthState } from "@/hooks/useAuthState";
import { UserProfile } from "@/types/auth";
import { supabase } from "@/lib/supabase";

export function useAuthProvider() {
  const navigate = useNavigate();
  const { user, loading, setUser, setLoading } = useAuthState();
  
  // Check for existing session on component mount
  useEffect(() => {
    async function checkCurrentSession() {
      try {
        setLoading(true);
        console.log("useAuthProvider: Checking current session");
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("useAuthProvider: Found existing session for user:", session.user.id);
          const profile = await fetchUserProfile(session.user.id);
          
          if (profile) {
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
            
            setUser(userProfile);
          } else {
            console.log("useAuthProvider: No profile found for user session");
            setUser(null);
          }
        } else {
          console.log("useAuthProvider: No active session found");
          setUser(null);
        }
      } catch (error) {
        console.error("useAuthProvider: Error checking session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    
    checkCurrentSession();
  }, [setUser, setLoading]);
  
  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("AuthProvider: Starting sign in process with:", email);
      const userData = await signInWithEmailAndPassword(email, password);
      
      if (userData) {
        console.log("AuthProvider: Sign in successful, user data:", userData);
        
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
        return userProfile;
      } else {
        console.error("AuthProvider: Sign in returned no user data");
        return null;
      }
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
