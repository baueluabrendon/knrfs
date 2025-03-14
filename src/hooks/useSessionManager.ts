
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/types/auth";
import { checkExistingSession, setupAuthStateChangeListener } from "@/services/authService";

export function useSessionManager(
  setUser: (user: UserProfile | null) => void,
  setLoading: (loading: boolean) => void
) {
  const navigate = useNavigate();
  
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    
    const initializeSession = async () => {
      try {
        setLoading(true);
        console.log("SessionManager: Checking for existing session");
        const sessionData = await checkExistingSession();
        
        if (sessionData) {
          const { userProfile, needsPasswordChange } = sessionData;
          console.log("SessionManager: Found existing session, profile:", userProfile);
          
          if (needsPasswordChange) {
            console.log("SessionManager: User needs to set password");
            navigate('/set-password');
          } else {
            setUser(userProfile);
            console.log("SessionManager: Setting user profile and redirecting based on role:", userProfile.role);
            
            if (userProfile.role === 'client') {
              navigate('/client');
            } else {
              navigate('/admin');
            }
          }
        } else {
          console.log("SessionManager: No existing session found");
          setUser(null);
        }
      } catch (error) {
        console.error("SessionManager: Initialization error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    const handleAuthStateChange = async (event: string, session: any, profile: UserProfile | null) => {
      console.log("SessionManager: Auth state changed:", event, "Profile:", profile);
      
      if (event === 'SIGNED_IN' && profile) {
        setUser(profile);
        
        if (profile.is_password_changed === false) {
          console.log("SessionManager: User needs to set password");
          navigate('/set-password');
        } else {
          console.log("SessionManager: User signed in, redirecting based on role:", profile.role);
          if (profile.role === 'client') {
            navigate('/client');
          } else {
            navigate('/admin');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("SessionManager: User signed out");
        setUser(null);
        navigate('/login');
      }
    };
    
    // Initialize session and set up auth state listener
    initializeSession();
    
    const setupSubscription = async () => {
      subscription = await setupAuthStateChangeListener(handleAuthStateChange);
    };
    
    setupSubscription();
    
    // Clean up subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [navigate, setUser, setLoading]);
}
