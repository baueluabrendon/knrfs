import { ApiResponse } from './types';

const API_BASE_URL = 'http://localhost:5000';

export const authApi = {
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }
      return data.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });
      const data: ApiResponse<any> = await response.json();
      return data.success;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};