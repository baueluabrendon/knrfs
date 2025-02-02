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

// User Management API calls
export const usersApi = {
  async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch users');
      }
      return data.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  async createUser(userData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create user');
      }
      return data.data;
    } catch (error) {
      console.error('Create user error:', error);
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

// Applications API calls
export const applicationsApi = {
  async getApplications() {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`);
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch applications');
      }
      return data.data;
    } catch (error) {
      console.error('Get applications error:', error);
      throw error;
    }
  },

  async updateApplicationStatus(applicationId: string, status: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const data: ApiResponse<any> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update application status');
      }
      return data.data;
    } catch (error) {
      console.error('Update application status error:', error);
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

// Recoveries API calls
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

// Analytics API calls
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

// Accounting API calls
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