
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/types/auth";
import { checkExistingSession, setupAuthStateChangeListener } from "@/services/sessionService";

export function useSessionManager(
  setUser: (user: UserProfile | null) => void,
  setLoading: (loading: boolean) => void
) {
  const navigate = useNavigate();
  
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setLoading(true);
        const sessionData = await checkExistingSession();
        
        if (sessionData) {
          const { userProfile, needsPasswordChange } = sessionData;
          
          if (needsPasswordChange) {
            console.log("SessionManager: User needs to set password");
            navigate('/set-password');
            setLoading(false);
            return;
          }
          
          setUser(userProfile);
          console.log("SessionManager: User state updated with profile:", userProfile);
          
          if (userProfile.role === 'client') {
            console.log("SessionManager: Redirecting to /client");
            navigate('/client');
          } else {
            console.log("SessionManager: Redirecting to /admin");
            navigate('/admin');
          }
        }
      } catch (error) {
        console.error("SessionManager: Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const handleAuthStateChange = (event: string, session: any, profile: UserProfile | null) => {
      if (event === 'SIGNED_IN' && profile) {
        console.log("SessionManager: User state updated on auth change:", profile);
        setUser(profile);
        
        if (profile.is_password_changed === false) {
          console.log("SessionManager: User needs to set password");
          navigate('/set-password');
          return;
        }
        
        if (profile.role === 'client') {
          navigate('/client');
        } else {
          navigate('/admin');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/login');
      }
    };
    
    initializeSession();
    
    const subscription = setupAuthStateChangeListener(handleAuthStateChange);
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, setUser, setLoading]);
}
