
import { ApiResponse } from './types';

const API_BASE_URL = 'http://localhost:5000';

export const loansApi = {
  async getLoans() {
    try {
      const response = await fetch(`${API_BASE_URL}/loans`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch loans');
      }
      return data.data;
    } catch (error) {
      console.error('Get loans error:', error);
      throw error;
    }
  },

  async createLoan(loanData: any) {
    try {
      // Ensure loan_id is provided for TypeScript validation 
      // (it will be overwritten by the database trigger)
      if (!loanData.loan_id) {
        loanData.loan_id = "temporary_id";
      }
      
      // Remove maturity_date if it exists as it will be calculated by the database trigger
      if (loanData.maturity_date) {
        delete loanData.maturity_date;
      }
      
      const response = await fetch(`${API_BASE_URL}/loans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData),
      });
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create loan');
      }
      return data.data;
    } catch (error) {
      console.error('Create loan error:', error);
      throw error;
    }
  },

  async uploadBulkLoans(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/loans/bulk`, {
        method: 'POST',
        body: formData,
      });
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to upload loans');
      }
      return data.data;
    } catch (error) {
      console.error('Bulk upload loans error:', error);
      throw error;
    }
  }
};
