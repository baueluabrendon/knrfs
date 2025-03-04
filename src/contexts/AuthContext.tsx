
import { createContext, useContext } from "react";
import { UserProfile } from "@/types/auth";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import { useSessionManager } from "@/hooks/useSessionManager";

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
  const {
    user,
    loading,
    signIn,
    signOut,
    sendPasswordResetEmail,
    sendVerificationEmail
  } = useAuthProvider();
  
  // Initialize session management
  useSessionManager(
    (newUser) => {
      if (user?.user_id !== newUser?.user_id) {
        console.log("AuthProvider: Session manager updated user");
      }
    },
    (isLoading) => {
      if (loading !== isLoading) {
        console.log("AuthProvider: Session manager updated loading state");
      }
    }
  );
  
  console.log("AuthContext: Current user state:", user);
  console.log("AuthContext: Loading state:", loading);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signOut,
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
