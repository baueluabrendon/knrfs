import { ApiResponse } from './types';

const API_BASE_URL = 'http://localhost:5000';

export const borrowersApi = {
  async getBorrowers() {
    try {
      const response = await fetch(`${API_BASE_URL}/borrowers`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch borrowers');
      }
      return data.data;
    } catch (error) {
      console.error('Get borrowers error:', error);
      throw error;
    }
  },

  async createBorrower(borrowerData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/borrowers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(borrowerData),
      });
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create borrower');
      }
      return data.data;
    } catch (error) {
      console.error('Create borrower error:', error);
      throw error;
    }
  },

  async uploadBulkBorrowers(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/borrowers/bulk`, {
        method: 'POST',
        body: formData,
      });
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to upload borrowers');
      }
      return data.data;
    } catch (error) {
      console.error('Bulk upload borrowers error:', error);
      throw error;
    }
  }
};