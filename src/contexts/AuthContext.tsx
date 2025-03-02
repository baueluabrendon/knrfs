
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signInWithEmailAndPassword, signOut } from "@/services/authService";
import { useAuthState } from "@/hooks/useAuthState";
import { UserProfile } from "@/types/auth";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, loading, setUser, setLoading } = useAuthState();

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("AuthContext: Starting sign in process with:", email);
      const userData = await signInWithEmailAndPassword(email, password);
      
      if (userData) {
        console.log("AuthContext: Sign in successful, user data:", userData);
        console.log("AuthContext: User role:", userData.role);
        
        // Transform the userData to match the UserProfile type from types/auth.ts
        const userProfile: UserProfile = {
          user_id: userData.user_id,
          id: userData.user_id, // Using user_id as id since it's required
          email: userData.email,
          role: userData.role as UserProfile['role'], // Cast to ensure type safety
          first_name: userData.first_name,
          last_name: userData.last_name,
          created_at: new Date().toISOString(), // Adding a default created_at since it's required
        };
        
        // Update user state with the properly formatted user profile
        setUser(userProfile);
        console.log("AuthContext: User state updated with formatted profile:", userProfile);
      } else {
        console.error("AuthContext: Sign in returned no user data");
      }
      
      return userData as unknown as UserProfile; // Cast to satisfy the return type
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
      // Clear the user state
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

  console.log("AuthContext: Current user state:", user);
  console.log("AuthContext: Loading state:", loading);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn: handleSignIn, 
      signOut: handleSignOut 
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
