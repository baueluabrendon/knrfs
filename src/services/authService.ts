
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserProfile as AuthUserProfile } from "@/types/auth";

// Local service interface that will be transformed to match the app's UserProfile type
export interface UserProfile {
  user_id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  is_password_changed?: boolean | null;
}

/**
 * Fetches a user profile from Supabase
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log("Fetching user profile for ID:", userId);
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (!profileError && profile) {
      console.log("User profile found:", profile);
      
      return {
        user_id: userId,
        email: profile.email || '',
        role: profile.role || 'client',
        first_name: profile.first_name || null,
        last_name: profile.last_name || null,
        is_password_changed: profile.is_password_changed
      };
    } else {
      console.error("Error fetching user profile:", profileError);
      return null;
    }
  } catch (error) {
    console.error("Profile fetch error:", error);
    return null;
  }
}

/**
 * Creates a new user profile in Supabase
 */
export async function createUserProfile(
  userId: string,
  email: string | undefined,
  role: string = 'administrator',
  firstName: string = 'Test',
  lastName: string = 'User'
): Promise<UserProfile | null> {
  try {
    console.log("Creating new user profile for:", userId);
    
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert([
        { 
          user_id: userId,
          email: email,
          role: role,
          first_name: firstName,
          last_name: lastName
        }
      ])
      .select()
      .single();
      
    if (!createError && newProfile) {
      console.log("Created new user profile:", newProfile);
      
      return {
        user_id: userId,
        email: email || '',
        role: newProfile.role,
        first_name: newProfile.first_name || null,
        last_name: newProfile.last_name || null
      };
    } else {
      console.error("Failed to create user profile:", createError);
      return null;
    }
  } catch (error) {
    console.error("Profile creation error:", error);
    return null;
  }
}

/**
 * Signs in a user with email and password
 */
export async function signInWithEmailAndPassword(
  email: string,
  password: string
): Promise<UserProfile | null> {
  try {
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
    
    // Fetch user profile
    let profile = await fetchUserProfile(data.user.id);
    
    // If profile doesn't exist, create one
    if (!profile) {
      profile = await createUserProfile(data.user.id, data.user.email);
    }
    
    return profile;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Signs out the current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error);
    toast.error(error.message || "Failed to sign out");
    throw error;
  }
}

/**
 * Gets the current session
 */
export async function getCurrentSession() {
  try {
    console.log("Checking existing session...");
    const { data } = await supabase.auth.getSession();
    
    if (data.session) {
      console.log("Existing session found:", data.session.user.id);
      return data.session;
    }
    
    console.log("No existing session found");
    return null;
  } catch (error) {
    console.error("Session check error:", error);
    return null;
  }
}
