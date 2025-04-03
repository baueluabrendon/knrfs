
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
    // Set up auth state listener first
    const subscription = authService.setupAuthListener((user) => {
      setAuthState((prev) => ({ 
        ...prev, 
        user,
        loading: false
      }));
    });
    
    // Then check for existing session
    const checkSession = async () => {
      try {
        const { userProfile } = await authService.checkSession();
        setAuthState({
          user: userProfile,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setAuthState({ user: null, loading: false, error: error.message });
      }
    };

    checkSession();
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        loading: authState.loading,
        error: authState.error,
        signIn: async (email, password) => {
          setAuthState((prev) => ({ ...prev, loading: true, error: null }));
          try {
            const userProfile = await authService.signIn(email, password);
            setAuthState({ user: userProfile, loading: false, error: null });
            return userProfile;
          } catch (error: any) {
            setAuthState({ user: null, loading: false, error: error.message });
            throw error;
          }
        },
        signOut: async () => {
          setAuthState((prev) => ({ ...prev, loading: true }));
          try {
            await authService.signOut();
            setAuthState({ user: null, loading: false, error: null });
            navigate("/login", { replace: true });
          } catch (error: any) {
            setAuthState((prev) => ({ ...prev, loading: false, error: error.message }));
          }
        },
        sendPasswordResetEmail: async (email) => {
          setAuthState((prev) => ({ ...prev, loading: true }));
          try {
            await authService.sendPasswordResetEmail(email);
          } catch (error: any) {
            console.error("AuthProvider: Password reset error:", error);
          } finally {
            setAuthState((prev) => ({ ...prev, loading: false }));
          }
        },
        updateUserProfile: (userData) => {
          setAuthState(prev => ({
            ...prev,
            user: prev.user ? { ...prev.user, ...userData } : null
          }));
        }
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
