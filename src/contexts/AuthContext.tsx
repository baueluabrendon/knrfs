import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserProfile(userId: string) {
    try {
      console.log('Fetching user profile for ID:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, email, role, firstname, lastname, createdat')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error.message);
        throw error;
      }

      console.log('Fetched user profile:', data);
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Error fetching user profile');
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (email: string, password: string): Promise<User | null> => {
    try {
      console.log('Attempting to sign in with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        throw error;
      }

      if (data.user) {
        console.log('Auth successful, fetching user profile...');
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_id, email, role, firstname, lastname, createdat')
          .eq('user_id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError.message);
          throw profileError;
        }

        console.log('Retrieved profile:', profile);
        if (profile) {
          setUser(profile);
          return profile;
        }
      }
      return null;
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in');
      return null;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
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