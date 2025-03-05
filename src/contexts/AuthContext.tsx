
import { createContext, useContext } from "react";
import { UserProfile } from "@/types/auth";
import { useAuthProvider } from "@/hooks/useAuthProvider";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    authState,
    signIn,
    signOut,
    sendPasswordResetEmail,
    sendVerificationEmail
  } = useAuthProvider();
  
  return (
    <AuthContext.Provider value={{ 
      user: authState.user, 
      loading: authState.loading, 
      error: authState.error,
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
