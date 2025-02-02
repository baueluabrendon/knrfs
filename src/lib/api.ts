// API endpoints configuration
const API_BASE_URL = 'http://localhost:5000';  // Adjust this to match your Python backend port

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Authentication API calls
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

// Borrowers API calls
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
  }
};

// Loans API calls
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
  }
};

// Repayments API calls
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
  }
};