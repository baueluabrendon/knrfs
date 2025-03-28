import { ApiResponse } from './types';

const API_BASE_URL = 'http://localhost:5000';

export const analyticsApi = {
  async getDashboardStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/dashboard`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch dashboard stats');
      }
      return data.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  async getLoanStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/loans`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch loan stats');
      }
      return data.data;
    } catch (error) {
      console.error('Get loan stats error:', error);
      throw error;
    }
  },

  async getRepaymentStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/repayments`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch repayment stats');
      }
      return data.data;
    } catch (error) {
      console.error('Get repayment stats error:', error);
      throw error;
    }
  }
};