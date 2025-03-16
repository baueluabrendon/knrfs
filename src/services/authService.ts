
import { supabase } from "@/integrations/supabase/client";
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

// The getCurrentSession function has been removed as it duplicates checkExistingSession functionality

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

/**
 * Checks for an existing session and returns the user profile
 */
export async function checkExistingSession() {
  try {
    console.log("SessionService: Checking for existing session...");
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log("SessionService: Found existing session", session.user.id);
      
      const profile = await fetchUserProfile(session.user.id);
      
      if (profile) {
        console.log("SessionService: Found user profile", profile);
        console.log("SessionService: User role is", profile.role);
        
        return { 
          userProfile: profile,
          needsPasswordChange: profile.is_password_changed === false 
        };
      }
    }
    
    console.log("SessionService: No valid session found");
    return null;
  } catch (error) {
    console.error("SessionService: Session check error:", error);
    return null;
  }
}

/**
 * Setup auth state change listener with user profile handling
 */
export async function setupAuthStateChangeListener(
  callback: (event: string, session: any, profile: UserProfile | null) => void
) {
  const { data } = await supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log("AuthService: Auth state changed:", event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("AuthService: User signed in with ID:", session.user.id);
        
        const profile = await fetchUserProfile(session.user.id);
          
        if (profile) {
          console.log("AuthService: Profile after auth change:", profile);
          callback(event, session, profile);
        } else {
          console.log("AuthService: No profile found after auth change");
          callback(event, session, null);
        }
      } else {
        callback(event, session, null);
      }
    }
  );
  
  return data.subscription;
}

/**
 * Create a user profile
 */
export async function createUserProfile(userId: string, email: string | null): Promise<UserProfile | null> {
  try {
    if (!email) {
      console.error("AuthService: Cannot create profile without email");
      return null;
    }
    
    const newProfile = {
      user_id: userId,
      email,
      role: 'client', // Default role
      first_name: '',
      last_name: '',
      is_password_changed: false
    };
    
    const { error } = await supabase
      .from('user_profiles')
      .insert(newProfile);
      
    if (error) {
      console.error("AuthService: Error creating profile:", error);
      return null;
    }
    
    return {
      ...newProfile,
      id: userId,
      created_at: new Date().toISOString(),
    } as UserProfile;
  } catch (error) {
    console.error("AuthService: Error creating user profile:", error);
    return null;
  }
}

/**
 * Create a new user with admin operations
 */
export async function createUserWithAdmin(email: string, password: string, userData: { 
  first_name: string, 
  last_name: string, 
  role: string 
}): Promise<{ user: any; error: any }> {
  try {
    console.log("AuthService: Creating new user with admin rights");
    
    // Import and use the supabaseAdmin client for admin operations
    const { supabaseAdmin } = await import('@/integrations/supabase/adminClient');
    
    // Create user with admin client
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (createError) {
      console.error("AuthService: Error creating user:", createError);
      return { user: null, error: createError };
    }

    if (!authData.user) {
      return { user: null, error: new Error("No user data returned") };
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        email: email,
        first_name: userData.first_name, // Use userData parameter, not authData
        last_name: userData.last_name,   // Use userData parameter, not authData
        role: userData.role,             // Use userData parameter, not authData
        is_password_changed: false
      });

    if (profileError) {
      console.error("AuthService: Error creating user profile:", profileError);
      return { user: null, error: profileError };
    }

    console.log("AuthService: Successfully created user and profile");
    return { user: authData.user, error: null };
  } catch (error) {
    console.error("AuthService: Error in createUserWithAdmin:", error);
    return { user: null, error };
  }
}
