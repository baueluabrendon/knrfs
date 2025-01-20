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
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error fetching user profile');
        throw error;
      }

      if (!profile) {
        console.log('No profile found, creating new profile');
        const { data: authUser } = await supabase.auth.getUser();
        
        if (!authUser?.user) {
          throw new Error('No authenticated user found');
        }

        const newProfile = {
          user_id: userId,
          email: authUser.user.email,
          role: 'SUPER_USER', // Since this is your admin profile
          firstname: 'Dev',
          lastname: 'Admin',
          createdat: new Date().toISOString()
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          toast.error('Failed to create user profile');
          throw createError;
        }

        setUser(createdProfile);
        console.log('Created new profile:', createdProfile);
        return;
      }

      setUser(profile);
      console.log('Found user profile:', profile);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      toast.error('Error with user profile');
      throw error;
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
        toast.error(error.message);
        throw error;
      }

      if (data.user) {
        console.log('Auth successful, fetching user profile...');
        await fetchUserProfile(data.user.id);
        toast.success('Successfully signed in');
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in');
      throw error;
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