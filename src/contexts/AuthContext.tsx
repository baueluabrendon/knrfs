
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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
        console.log("Checking existing session...");
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log("Existing session found:", data.session.user.id);
          console.log("Attempting to fetch user profile for ID:", data.session.user.id);
          
          // Fetch user profile if session exists
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single();
            
          if (!profileError && profile) {
            console.log("User profile found:", profile);
            console.log("User role from profile:", profile.role);
            
            setUser({
              user_id: data.session.user.id,
              email: data.session.user.email || '',
              role: profile.role || 'client',
              first_name: profile.first_name || null,
              last_name: profile.last_name || null
            });
            
            console.log("User state set with role:", profile.role);
          } else {
            console.error("Error fetching user profile:", profileError);
            console.log("Will attempt to create a profile for this user...");
            
            // If no profile exists, try to create one with administrator role
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert([
                { 
                  user_id: data.session.user.id,
                  email: data.session.user.email,
                  role: 'administrator',
                  first_name: 'Test',
                  last_name: 'User'
                }
              ])
              .select()
              .single();
              
            if (!createError && newProfile) {
              console.log("Created new user profile:", newProfile);
              setUser({
                user_id: data.session.user.id,
                email: data.session.user.email || '',
                role: newProfile.role,
                first_name: newProfile.first_name || null,
                last_name: newProfile.last_name || null
              });
            } else {
              console.error("Failed to create user profile:", createError);
            }
          }
        } else {
          console.log("No existing session found");
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
        console.log("Auth state changed:", event, session);
        
        if (event === 'SIGNED_IN' && session) {
          try {
            console.log("User signed in, fetching profile for:", session.user.id);
            // Fetch user profile when signed in
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
              
            if (!profileError && profile) {
              console.log("User profile retrieved on auth state change:", profile);
              console.log("User role from profile:", profile.role);
              
              setUser({
                user_id: session.user.id,
                email: session.user.email || '',
                role: profile.role || 'client',
                first_name: profile.first_name || null,
                last_name: profile.last_name || null
              });
              
              console.log("User state updated with role:", profile.role);
            } else {
              console.error("Error fetching profile on auth state change:", profileError);
              console.log("Will attempt to create a profile on sign in...");
              
              // If no profile exists, try to create one with administrator role
              const { data: newProfile, error: createError } = await supabase
                .from('user_profiles')
                .insert([
                  { 
                    user_id: session.user.id,
                    email: session.user.email,
                    role: 'administrator',
                    first_name: 'Test',
                    last_name: 'User'
                  }
                ])
                .select()
                .single();
                
              if (!createError && newProfile) {
                console.log("Created new user profile on sign in:", newProfile);
                setUser({
                  user_id: session.user.id,
                  email: session.user.email || '',
                  role: newProfile.role,
                  first_name: newProfile.first_name || null,
                  last_name: newProfile.last_name || null
                });
              } else {
                console.error("Failed to create user profile on sign in:", createError);
              }
            }
          } catch (error) {
            console.error("Profile fetch error:", error);
          } finally {
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          setUser(null);
          setLoading(false);
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
      console.log("Attempting login with:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Supabase auth error:", error);
        throw error;
      }

      console.log("Supabase auth successful:", data);
      console.log("Fetching user profile for user ID:", data.user.id);
      
      // Fetch user profile after successful authentication
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        console.log("Will attempt to create a profile for this user...");
        
        // If no profile exists, try to create one with administrator role
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([
            { 
              user_id: data.user.id,
              email: data.user.email,
              role: 'administrator',
              first_name: 'Test',
              last_name: 'User'
            }
          ])
          .select()
          .single();
          
        if (!createError && newProfile) {
          console.log("Created new user profile on sign in:", newProfile);
          
          const userData: UserProfile = {
            user_id: data.user.id,
            email: data.user.email || '',
            role: newProfile.role,
            first_name: newProfile.first_name || null,
            last_name: newProfile.last_name || null
          };
          
          setUser(userData);
          return userData;
        } else {
          console.error("Failed to create user profile:", createError);
          throw new Error('Failed to create user profile');
        }
      }

      console.log("User profile retrieved:", profile);
      console.log("User role from profile:", profile?.role);
      
      // Construct user data
      const userData: UserProfile = {
        user_id: data.user.id,
        email: data.user.email || '',
        role: profile?.role || 'client',
        first_name: profile?.first_name || null,
        last_name: profile?.last_name || null
      };
      
      console.log("Setting user state with role:", userData.role);
      setUser(userData);
      return userData;
    } catch (error: any) {
      console.error("Login error:", error);
      throw error; // Propagate the error to be handled by the component
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      navigate('/login');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to sign out");
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
