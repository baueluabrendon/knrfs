import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<void>;
  updateUserProfile: (userData: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      setAuthState((prev) => ({ ...prev, loading: true }));

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        console.log("AuthProvider: No active session");
        setAuthState({ user: null, loading: false, error: null });
        return;
      }

      console.log("AuthProvider: Found session for user:", session.user.id);

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("user_id, email, role, first_name, last_name, is_password_changed")
        .eq("user_id", session.user.id)
        .single();

      if (profileError || !profile) {
        console.error("AuthProvider: Failed to fetch user profile", profileError);
        setAuthState({ user: null, loading: false, error: "Failed to fetch user profile" });
        return;
      }

      setAuthState({
        user: {
          ...profile,
          id: profile.user_id,
          created_at: new Date().toISOString(),
          role: profile.role as UserProfile["role"],
        },
        loading: false,
        error: null,
      });
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string): Promise<UserProfile | null> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw new Error(error.message || "Login failed");
      }

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("user_id, email, role, first_name, last_name, is_password_changed")
        .eq("user_id", data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("User profile not found");
      }

      const userProfile: UserProfile = {
        ...profile,
        id: profile.user_id,
        created_at: new Date().toISOString(),
        role: profile.role as UserProfile["role"],
      };

      setAuthState({ user: userProfile, loading: false, error: null });
      
      if (!profile.is_password_changed) {
        console.log("First login detected, redirect to password change after sign in");
        // We'll navigate to set-password in LoginForm component
      }
      
      return userProfile;
    } catch (error: any) {
      console.error("AuthProvider: Sign in error", error);
      setAuthState({ user: null, loading: false, error: error.message });
      return null;
    }
  };

  const signOut = async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      await supabase.auth.signOut();
      setAuthState({ user: null, loading: false, error: null });
      toast.success("Successfully signed out");
      navigate("/login", { replace: true });
    } catch (error: any) {
      console.error("AuthProvider: Sign out error", error);
      setAuthState((prev) => ({ ...prev, loading: false, error: error.message }));
      toast.error("Failed to sign out");
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/set-password`,
      });

      if (error) throw error;

      toast.success("Password reset email sent. Please check your inbox.");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  };

  const sendVerificationEmail = async (email: string) => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/login` },
      });

      if (error) throw error;

      toast.success("Verification email sent. Please check your inbox.");
    } catch (error: any) {
      console.error("Verification email error:", error);
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  };

  const updateUserProfile = (userData: Partial<UserProfile>) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        loading: authState.loading,
        error: authState.error,
        signIn,
        signOut,
        sendPasswordResetEmail,
        sendVerificationEmail,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
