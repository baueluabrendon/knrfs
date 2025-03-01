
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  user_id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          // Fetch user profile if session exists
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single();
            
          if (!profileError && profile) {
            setUser({
              user_id: data.session.user.id,
              email: data.session.user.email || '',
              role: profile.role || 'client',
              first_name: profile.first_name || null,
              last_name: profile.last_name || null
            });
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            // Fetch user profile when signed in
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
              
            if (!profileError && profile) {
              setUser({
                user_id: session.user.id,
                email: session.user.email || '',
                role: profile.role || 'client',
                first_name: profile.first_name || null,
                last_name: profile.last_name || null
              });
            }
          } catch (error) {
            console.error("Profile fetch error:", error);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    checkSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await authApi.login(email, password);
      console.log("Login response:", userData); // Debug log
      setUser(userData);
      return userData;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to sign in");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authApi.logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
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
