
import { UserProfile } from "@/types/auth";
import { supabase } from "@/lib/supabase";

export async function checkExistingSession() {
  try {
    console.log("SessionService: Checking for existing session...");
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log("SessionService: Found existing session", session.user.id);
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (profile) {
        console.log("SessionService: Found user profile", profile);
        console.log("SessionService: User role is", profile.role);
        
        const userProfile: UserProfile = {
          user_id: profile.user_id,
          id: profile.user_id,
          email: profile.email,
          role: profile.role as UserProfile['role'],
          first_name: profile.first_name,
          last_name: profile.last_name,
          created_at: new Date().toISOString(),
          is_password_changed: profile.is_password_changed,
        };
        
        return { 
          userProfile,
          needsPasswordChange: profile.is_password_changed === false 
        };
      } else {
        console.log("SessionService: No user profile found", error);
        return null;
      }
    } else {
      console.log("SessionService: No session found");
      return null;
    }
  } catch (error) {
    console.error("SessionService: Session check error:", error);
    return null;
  }
}

export async function setupAuthStateChangeListener(
  callback: (event: string, session: any, profile: UserProfile | null) => void
) {
  const { data } = await supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log("SessionService: Auth state changed:", event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("SessionService: User signed in with ID:", session.user.id);
        
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (profile) {
          console.log("SessionService: Profile after auth change:", profile);
          console.log("SessionService: User role is", profile.role);
          
          const userProfile: UserProfile = {
            user_id: profile.user_id,
            id: profile.user_id,
            email: profile.email,
            role: profile.role as UserProfile['role'],
            first_name: profile.first_name,
            last_name: profile.last_name,
            created_at: new Date().toISOString(),
            is_password_changed: profile.is_password_changed,
          };
          
          callback(event, session, userProfile);
        } else {
          console.log("SessionService: No profile found after auth change", error);
          callback(event, session, null);
        }
      } else {
        callback(event, session, null);
      }
    }
  );
  
  return data.subscription;
}
