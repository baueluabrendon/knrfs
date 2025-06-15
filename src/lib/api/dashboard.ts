
import { ApiResponse } from './types';

const API_BASE_URL = 'http://localhost:5000';

export const dashboardApi = {
  async getMetrics() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/metrics`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch dashboard metrics');
      }
      return data.data;
    } catch (error) {
      console.error('Get dashboard metrics error:', error);
      throw error;
    }
  }
};
