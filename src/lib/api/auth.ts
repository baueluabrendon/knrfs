
import { supabase } from "@/integrations/supabase/client";
import { ApiResponse } from './types';

export const authApi = {
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw new Error(error.message || 'Login failed');
      }

      // Fetch user profile data after successful authentication
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Failed to fetch user profile');
      }

      // Return user data in the expected format
      return {
        user_id: data.user.id,
        email: data.user.email || '',
        role: profile?.role || 'client', // Default to client if no role found
        first_name: profile?.first_name || null,
        last_name: profile?.last_name || null
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};
