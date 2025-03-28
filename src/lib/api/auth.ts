
import { ApiResponse } from './types';
import { checkSession } from '@/services/authService';

/**
 * API methods for authentication-related operations
 * This file now mostly redirects to the centralized authService
 */
export const authApi = {
  /**
   * Checks if a user is currently authenticated
   */
  async checkSession(): Promise<ApiResponse<any>> {
    try {
      const { userProfile, needsPasswordChange } = await checkSession();
      
      return { 
        success: true, 
        data: userProfile
      };
    } catch (error: any) {
      console.error('Session check error:', error);
      return { success: false, error: error.message };
    }
  }
};
