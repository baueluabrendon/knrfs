import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthResponse } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UserProfile {
  user_id: string;
  email: string;
  role: "client" | "sales officer" | "accounts officer" | "recoveries officer" | "administrator" | "super user";
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session data:", session); // Debug log
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast.error('Error initializing authentication');
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session); // Debug log
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserProfile(userId: string) {
    console.log("Fetching user profile for ID:", userId); // Debug log
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      console.log("Profile data:", profile, "Error:", error); // Debug log

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error fetching user profile');
        setUser(null);
        setLoading(false);
        return;
      }

      if (profile) {
        setUser(profile as UserProfile);
        console.log("User profile set:", profile); // Debug log
      } else {
        console.error('No profile found for user');
        toast.error('User profile not found');
        setUser(null);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      toast.error('Error with user profile');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (email: string, password: string): Promise<UserProfile | null> => {
    try {
      console.log("Attempting sign in for:", email); // Debug log
      const { data: authData, error: authError }: AuthResponse = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Auth response:", authData, "Error:", authError); // Debug log

      if (authError) {
        console.error('Auth error:', authError);
        toast.error(authError.message);
        return null;
      }

      if (!authData.user) {
        toast.error('No user data returned');
        return null;
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      console.log("Profile fetch response:", profile, "Error:", profileError); // Debug log

      if (profileError) {
        console.error('Profile error:', profileError);
        toast.error('Error fetching user profile');
        return null;
      }

      if (!profile) {
        toast.error('User profile not found');
        return null;
      }

      setUser(profile as UserProfile);
      toast.success('Successfully signed in');
      return profile as UserProfile;

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