import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile } from "@/types/auth";

/**
 * Centralized user profile fetching
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log("AuthService: Fetching user profile for:", userId);
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('user_id, email, role, first_name, last_name, is_password_changed, borrower_id')
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
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError) {
      throw authError;
    }
    
    if (!authData.user) {
      throw new Error("No user data returned");
    }
    
    const profile = await fetchUserProfile(authData.user.id);
    if (!profile) {
      throw new Error("Failed to fetch user profile");
    }
    
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    toast.success("Successfully signed out");
    return true;
  } catch (error) {
    console.error("AuthService: Error signing out:", error);
    toast.error("Error signing out");
    return false;
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
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    
    if (!userData.user) {
      throw new Error("User session not found after password update");
    }
    
    // Update the user's profile to mark password as changed
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ is_password_changed: true })
      .eq('user_id', userData.user.id);
    
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
 * Check for an existing session and returns the user profile
 */
export async function checkSession(): Promise<{ userProfile: UserProfile | null, needsPasswordChange: boolean }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    if (!data.session) {
      return { userProfile: null, needsPasswordChange: false };
    }
    
    const profile = await fetchUserProfile(data.session.user.id);
    
    if (!profile) {
      return { userProfile: null, needsPasswordChange: false };
    }
    
    return { 
      userProfile: profile,
      needsPasswordChange: profile.is_password_changed === false 
    };
  } catch (error) {
    console.error("AuthService: Session check error:", error);
    return { userProfile: null, needsPasswordChange: false };
  }
}

/**
 * Setup auth state change listener
 */
export function setupAuthListener(callback: (user: UserProfile | null) => void): { unsubscribe: () => void } {
  const { data } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Use setTimeout to prevent potential deadlocks with Supabase client
        setTimeout(async () => {
          const profile = await fetchUserProfile(session.user.id);
          callback(profile);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    }
  );
  
  return { unsubscribe: () => data.subscription.unsubscribe() };
}

/**
 * Create a user with admin operations
 * Note: this function requires service_role key and should be used server-side only
 */
export async function createUserWithAdmin(email: string, password: string, userData: { 
  first_name: string, 
  last_name: string, 
  role: string 
}): Promise<{ user: any; error: any }> {
  try {
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: {
        email,
        password,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role
      }
    })

    if (error) throw error
    return { user: data.user, error: null }
  } catch (error) {
    console.error('Error creating user:', error)
    return { user: null, error }
  }
}
