import { ApiResponse } from './types';

const API_BASE_URL = 'http://localhost:5000';

export const repaymentsApi = {
  async getRepayments() {
    try {
      const response = await fetch(`${API_BASE_URL}/repayments`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch repayments');
      }
      return data.data;
    } catch (error) {
      console.error('Get repayments error:', error);
      throw error;
    }
  },

  async createRepayment(repaymentData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/repayments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(repaymentData),
      });
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create repayment');
      }
      return data.data;
    } catch (error) {
      console.error('Create repayment error:', error);
      throw error;
    }
  },

  async uploadBulkRepayments(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/repayments/bulk`, {
        method: 'POST',
        body: formData,
      });
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to upload repayments');
      }
      return data.data;
    } catch (error) {
      console.error('Bulk upload repayments error:', error);
      throw error;
    }
  }
};