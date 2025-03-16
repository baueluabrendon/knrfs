
import { ApiResponse } from './types';
import { supabase } from '@/integrations/supabase/client';
import type { UserProfile } from '@/types/auth';

/**
 * API methods for authentication-related operations
 */
export const authApi = {
  /**
   * Checks if a user is currently authenticated
   */
  async checkSession(): Promise<ApiResponse<UserProfile | null>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { success: true, data: null };
      }
      
      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return { success: false, error: error.message };
      }
      
      const profile: UserProfile = {
        ...userProfile,
        id: userProfile.user_id,
        created_at: userProfile.created_at || new Date().toISOString(),
        role: userProfile.role as UserProfile['role']
      };
      
      return { success: true, data: profile };
    } catch (error: any) {
      console.error('Session check error:', error);
      return { success: false, error: error.message };
    }
  }
};
