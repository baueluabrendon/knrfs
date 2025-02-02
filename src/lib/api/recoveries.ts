import { ApiResponse } from './types';

const API_BASE_URL = 'http://localhost:5000';

export const recoveriesApi = {
  async getLoansInArrears() {
    try {
      const response = await fetch(`${API_BASE_URL}/recoveries/arrears`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch loans in arrears');
      }
      return data.data;
    } catch (error) {
      console.error('Get loans in arrears error:', error);
      throw error;
    }
  },

  async getMissedPayments() {
    try {
      const response = await fetch(`${API_BASE_URL}/recoveries/missed-payments`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch missed payments');
      }
      return data.data;
    } catch (error) {
      console.error('Get missed payments error:', error);
      throw error;
    }
  },

  async getPartialPayments() {
    try {
      const response = await fetch(`${API_BASE_URL}/recoveries/partial-payments`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch partial payments');
      }
      return data.data;
    } catch (error) {
      console.error('Get partial payments error:', error);
      throw error;
    }
  }
};