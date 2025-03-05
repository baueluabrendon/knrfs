
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserProfile } from "@/types/auth";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/lib/supabase";

export function useAuthProvider() {
  const navigate = useNavigate();
  const { user, loading, setUser, setLoading } = useAuthState();
  
  // Check for existing session on component mount
  useEffect(() => {
    const checkCurrentSession = async () => {
      try {
        setLoading(true);
        console.log("useAuthProvider: Checking current session");
        
        // Get auth session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session retrieval error:", sessionError);
          setUser(null);
          return;
        }
        
        if (!session?.user) {
          console.log("useAuthProvider: No active session found");
          setUser(null);
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
            setUser(null);
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
            
            setUser(userProfile);
          } else {
            console.log("useAuthProvider: No profile found for user session");
            setUser(null);
          }
        } catch (profileError) {
          console.error("Profile fetch error:", profileError);
          setUser(null);
        }
      } catch (error) {
        console.error("useAuthProvider: Error checking session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkCurrentSession();
  }, [setUser, setLoading]);
  
  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("AuthProvider: Starting sign in process with:", email);
      
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Supabase auth error:", error);
        throw error;
      }

      if (!data.user) {
        console.error("No user returned from authentication");
        throw new Error("No user returned from authentication");
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
        throw new Error("Failed to retrieve user profile. This might be due to a permission issue.");
      }
      
      if (!profile) {
        console.error("No profile found for authenticated user");
        throw new Error("User profile not found. Please contact support.");
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
      setUser(userProfile);
      
      console.log("AuthProvider: Login successful, returning user profile");
      return userProfile;
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
      await supabase.auth.signOut();
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
