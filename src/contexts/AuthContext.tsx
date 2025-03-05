
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true, // Start with loading to check session
    error: null,
  });

  const navigate = useNavigate();

  // ✅ Load user session on mount
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
        },
        loading: false,
        error: null,
      });
    };

    checkSession();
  }, []);

  // ✅ Sign In
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
      };

      setAuthState({ user: userProfile, loading: false, error: null });
      
      return userProfile;
    } catch (error: any) {
      console.error("AuthProvider: Sign in error", error);
      setAuthState({ user: null, loading: false, error: error.message });
      return null;
    }
  };

  // ✅ Sign Out
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

  // ✅ Send Password Reset Email
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

  // ✅ Send Verification Email
  const sendVerificationEmail = async (email: string) => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/set-password` },
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Custom Hook to Use Auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
