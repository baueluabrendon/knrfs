import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';
import { activityLogsApi } from '@/lib/api/activity-logs';
import { ApiResponse } from './types';

const API_BASE_URL = 'http://localhost:5000';

export const usersApi = {
  async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch users');
      }
      return data.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  async createUser(userData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create user');
      }

      // Log the user creation activity
      await activityLogsApi.logActivity(
        'CREATE',
        'user_profiles',
        data.data?.id,
        `Created new user: ${userData.first_name} ${userData.last_name} (${userData.role})`,
        { email: userData.email, role: userData.role, branch_id: userData.branch_id }
      );

      return data.data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }
};