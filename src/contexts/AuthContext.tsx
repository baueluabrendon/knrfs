import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signInWithEmailAndPassword, signOut, getCurrentSession } from "@/services/authService";
import { useAuthState } from "@/hooks/useAuthState";
import { UserProfile } from "@/types/auth";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, loading, setUser, setLoading } = useAuthState();
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        console.log("AuthProvider: Checking for existing session...");
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("AuthProvider: Found existing session");
          
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          if (profile) {
            console.log("AuthProvider: Found user profile", profile);
            
            if (profile.is_password_changed === false) {
              console.log("AuthProvider: User needs to set password");
              navigate('/set-password');
              setLoading(false);
              return;
            }
            
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
            console.log("AuthProvider: User state updated with profile:", userProfile);
            
            if (userProfile.role === 'client') {
              console.log("AuthProvider: Redirecting to /client");
              navigate('/client');
            } else {
              console.log("AuthProvider: Redirecting to /admin");
              navigate('/admin');
            }
          } else {
            console.log("AuthProvider: No user profile found", error);
            setLoading(false);
          }
        } else {
          console.log("AuthProvider: No session found");
          setLoading(false);
        }
      } catch (error) {
        console.error("AuthProvider: Session check error:", error);
        setLoading(false);
      }
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider: Auth state changed:", event);
        
        if (event === 'SIGNED_IN') {
          if (!session?.user) return;
          
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          if (profile) {
            console.log("AuthProvider: Profile after auth change:", profile);
            
            if (profile.is_password_changed === false) {
              console.log("AuthProvider: User needs to set password");
              navigate('/set-password');
              return;
            }
            
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
            console.log("AuthProvider: User state updated on auth change:", userProfile);
            
            if (userProfile.role === 'client') {
              navigate('/client');
            } else {
              navigate('/admin');
            }
          } else {
            console.log("AuthProvider: No profile found after auth change", error);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/login');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  console.log("AuthContext: Current user state:", user);
  console.log("AuthContext: Loading state:", loading);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn: handleSignIn, 
      signOut: handleSignOut,
      sendPasswordResetEmail,
      sendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
