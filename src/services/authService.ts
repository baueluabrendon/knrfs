
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserProfile } from "@/types/auth";

/**
 * Fetches a user profile from the database
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log("AuthService: Fetching user profile for:", userId);
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('user_id, email, role, first_name, last_name, is_password_changed')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error("AuthService: Error fetching profile:", error);
      return null;
    }
    
    if (!profile) {
      console.error("AuthService: No profile found for user");
      return null;
    }
    
    // Convert role string to valid UserProfile role
    const userRole = profile.role as UserProfile["role"];
    
    return {
      ...profile,
      id: profile.user_id, // Add id property matching user_id
      role: userRole,
      created_at: new Date().toISOString(),
    } as UserProfile;
  } catch (error) {
    console.error("AuthService: Error in fetchUserProfile:", error);
    return null;
  }
}

/**
 * Signs in a user with email and password
 */
export async function signIn(email: string, password: string): Promise<UserProfile | null> {
  try {
    console.log("AuthService: Attempting to sign in with email:", email);
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError) {
      console.error("AuthService: Auth error:", authError);
      throw authError;
    }
    
    if (!authData.user) {
      console.error("AuthService: No user data returned");
      throw new Error("No user data returned");
    }
    
    console.log("AuthService: Auth successful, fetching profile for user:", authData.user.id);
    
    const profile = await fetchUserProfile(authData.user.id);
    if (!profile) {
      throw new Error("Failed to fetch user profile");
    }
    
    console.log("AuthService: Successfully fetched profile:", profile);
    toast.success("Successfully signed in");
    return profile;
  } catch (error) {
    console.error("AuthService: Error signing in:", error);
    throw error;
  }
}

/**
 * Signs out the current user
 */
export async function signOut(): Promise<boolean> {
  try {
    await supabase.auth.signOut();
    toast.success("Successfully signed out");
    return true;
  } catch (error) {
    console.error("AuthService: Error signing out:", error);
    toast.error("Error signing out");
    return false;
  }
}

/**
 * Gets the current session
 */
export async function getCurrentSession() {
  try {
    console.log("AuthService: Checking current session");
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log("AuthService: Found existing session", session.user.id);
      return session;
    }
    
    console.log("AuthService: No session found");
    return null;
  } catch (error) {
    console.error("AuthService: Session check error:", error);
    return null;
  }
}

/**
 * Sends a password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/set-password`,
    });
    
    if (error) {
      throw error;
    }
    
    toast.success("Password reset email sent. Please check your inbox.");
    return true;
  } catch (error: any) {
    console.error("AuthService: Password reset error:", error);
    toast.error(error.message || "Failed to send password reset email");
    return false;
  }
}

/**
 * Updates a user's password
 */
export async function updatePassword(password: string): Promise<boolean> {
  try {
    // Update the user's password
    const { error: passwordError } = await supabase.auth.updateUser({
      password: password,
    });
    
    if (passwordError) throw passwordError;
    
    // Get current user to ensure we have the latest session
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      throw new Error("User session not found after password update");
    }
    
    // Update the user's profile to mark password as changed
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ is_password_changed: true })
      .eq('user_id', currentUser.id);
    
    if (profileError) {
      throw profileError;
    }
    
    toast.success("Password updated successfully!");
    return true;
  } catch (error: any) {
    console.error("AuthService: Password update error:", error);
    toast.error(error.message || "Failed to update password");
    return false;
  }
}

/**
 * Sets up an auth state change listener
 */
export function setupAuthListener(callback: (user: UserProfile | null) => void): { unsubscribe: () => void } {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log("AuthService: Auth state changed:", event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        callback(profile);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    }
  );
  
  return subscription;
}
