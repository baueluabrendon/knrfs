
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  UserProfile, 
  fetchUserProfile, 
  createUserProfile,
  getCurrentSession
} from "@/services/authService";

export function useAuthState() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getCurrentSession();
        
        if (session) {
          // Fetch user profile if session exists
          let profile = await fetchUserProfile(session.user.id);
            
          if (profile) {
            console.log("User profile found:", profile);
            setUser(profile);
          } else {
            console.log("Will attempt to create a profile for this user...");
            
            // If no profile exists, create one
            const newProfile = await createUserProfile(
              session.user.id,
              session.user.email
            );
              
            if (newProfile) {
              setUser(newProfile);
            }
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
        console.log("Auth state changed:", event, session);
        
        if (event === 'SIGNED_IN' && session) {
          try {
            console.log("User signed in, fetching profile for:", session.user.id);
            
            // Fetch user profile when signed in
            let profile = await fetchUserProfile(session.user.id);
              
            if (profile) {
              console.log("User profile retrieved on auth state change:", profile);
              setUser(profile);
            } else {
              console.log("Will attempt to create a profile on sign in...");
              
              // If no profile exists, create one
              const newProfile = await createUserProfile(
                session.user.id,
                session.user.email
              );
                
              if (newProfile) {
                setUser(newProfile);
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

  return { user, loading, setUser };
}
