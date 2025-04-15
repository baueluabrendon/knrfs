
import { ApiResponse } from './types';

const API_BASE_URL = 'http://localhost:5000';

export const accountingApi = {
  async getChartOfAccounts() {
    try {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .order('account_id');
      
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Get chart of accounts error:', error);
      throw error;
    }
  },

  async getFiscalPeriods() {
    try {
      const { data, error } = await supabase
        .from('fiscal_periods')
        .select('*')
        .order('start_date');
      
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Get fiscal periods error:', error);
      throw error;
    }
  },

  async getBalanceSheet(periodId) {
    try {
      const { data, error } = await supabase
        .rpc('generate_balance_sheet', { p_period_id: periodId });
      
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Get balance sheet error:', error);
      throw error;
    }
  },

  async getProfitAndLoss(periodId) {
    try {
      const { data, error } = await supabase
        .rpc('generate_profit_loss', { p_period_id: periodId });
      
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Get profit and loss error:', error);
      throw error;
    }
  },

  async getCashflow(periodId) {
    try {
      const { data, error } = await supabase
        .rpc('generate_cashflow', { p_period_id: periodId });
      
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Get cashflow error:', error);
      throw error;
    }
  },

  async saveTransaction(transaction, transactionLines) {
    try {
      // First insert the transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('accounting_transactions')
        .insert(transaction)
        .select('transaction_id')
        .single();
      
      if (transactionError) throw new Error(transactionError.message);
      
      // Then insert all transaction lines with the returned transaction ID
      const transactionLinesWithId = transactionLines.map(line => ({
        ...line,
        transaction_id: transactionData.transaction_id
      }));
      
      const { error: linesError } = await supabase
        .from('transaction_lines')
        .insert(transactionLinesWithId);
      
      if (linesError) throw new Error(linesError.message);
      
      return transactionData;
    } catch (error) {
      console.error('Save transaction error:', error);
      throw error;
    }
  },
  
  async saveFinancialReport(report) {
    try {
      const { data, error } = await supabase
        .from('financial_reports')
        .insert(report)
        .select('*')
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Save financial report error:', error);
      throw error;
    }
  }
};
