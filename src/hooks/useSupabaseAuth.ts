import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserProfile } from '@/types/auth';

export async function fetchUserProfile(userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error fetching user profile');
      return null;
    }

    return profile as UserProfile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    toast.error('Error with user profile');
    return null;
  }
}

export async function signInWithSupabase(email: string, password: string) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Auth error:', authError);
      toast.error(authError.message);
      return null;
    }

    if (!authData.user) {
      toast.error('No user data returned');
      return null;
    }

    const profile = await fetchUserProfile(authData.user.id);
    if (profile) {
      toast.success('Successfully signed in');
    }
    return profile;
  } catch (error) {
    console.error('Error signing in:', error);
    toast.error('Failed to sign in');
    return null;
  }
}

export async function signOutFromSupabase() {
  try {
    await supabase.auth.signOut();
    toast.success('Successfully signed out');
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    toast.error('Error signing out');
    return false;
  }
}