
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserProfile } from "@/types/auth";
import { useNavigate } from "react-router-dom";
import * as authService from "@/services/authService";

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
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

      try {
        const session = await authService.getCurrentSession();
        
        if (!session) {
          console.log("AuthProvider: No active session");
          setAuthState({ user: null, loading: false, error: null });
          return;
        }

        console.log("AuthProvider: Found session for user:", session.user.id);
        
        const profile = await authService.fetchUserProfile(session.user.id);
        
        if (!profile) {
          console.error("AuthProvider: Failed to fetch user profile");
          setAuthState({ user: null, loading: false, error: "Failed to fetch user profile" });
          return;
        }

        setAuthState({
          user: profile,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        console.error("AuthProvider: Session check error:", error);
        setAuthState({ user: null, loading: false, error: error.message });
      }
    };

    checkSession();
    
    // Set up auth state change listener
    const subscription = authService.setupAuthListener((user) => {
      setAuthState((prev) => ({ 
        ...prev, 
        user,
        loading: false
      }));
    });
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<UserProfile | null> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const userProfile = await authService.signIn(email, password);
      
      if (!userProfile) {
        throw new Error("Failed to sign in");
      }
      
      setAuthState({ user: userProfile, loading: false, error: null });
      return userProfile;
    } catch (error: any) {
      console.error("AuthProvider: Sign in error", error);
      setAuthState({ user: null, loading: false, error: error.message });
      throw error;
    }
  };

  const signOut = async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      await authService.signOut();
      setAuthState({ user: null, loading: false, error: null });
      navigate("/login", { replace: true });
    } catch (error: any) {
      console.error("AuthProvider: Sign out error", error);
      setAuthState((prev) => ({ ...prev, loading: false, error: error.message }));
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      await authService.sendPasswordResetEmail(email);
    } catch (error: any) {
      console.error("AuthProvider: Password reset error:", error);
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
