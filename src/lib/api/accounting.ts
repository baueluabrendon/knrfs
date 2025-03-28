import { ApiResponse } from './types';

const API_BASE_URL = 'http://localhost:5000';

export const accountingApi = {
  async getChartOfAccounts() {
    try {
      const response = await fetch(`${API_BASE_URL}/accounting/chart-of-accounts`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch chart of accounts');
      }
      return data.data;
    } catch (error) {
      console.error('Get chart of accounts error:', error);
      throw error;
    }
  },

  async getBalanceSheet() {
    try {
      const response = await fetch(`${API_BASE_URL}/accounting/balance-sheet`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch balance sheet');
      }
      return data.data;
    } catch (error) {
      console.error('Get balance sheet error:', error);
      throw error;
    }
  },

  async getProfitAndLoss() {
    try {
      const response = await fetch(`${API_BASE_URL}/accounting/profit-loss`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch profit and loss');
      }
      return data.data;
    } catch (error) {
      console.error('Get profit and loss error:', error);
      throw error;
    }
  },

  async getCashflow() {
    try {
      const response = await fetch(`${API_BASE_URL}/accounting/cashflow`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch cashflow');
      }
      return data.data;
    } catch (error) {
      console.error('Get cashflow error:', error);
      throw error;
    }
  }
};