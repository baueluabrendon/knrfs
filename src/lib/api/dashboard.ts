
import { ApiResponse } from './types';

const API_BASE_URL = 'http://localhost:5000';

export interface DashboardMetrics {
  active_loans_count: number;
  active_borrowers_count: number;
  at_risk_loans_count: number;
  pending_applications_count: number;
  total_principal_amount: number;
  total_outstanding_balance: number;
  total_repayments_amount: number;
  avg_loan_duration_days: number;
}

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
