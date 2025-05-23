
import { supabase } from '@/integrations/supabase/client';
import { 
  ChartOfAccount, 
  FiscalPeriod, 
  Transaction, 
  TransactionLine, 
  FinancialReport, 
  BalanceSheetData,
  ProfitLossData,
  CashflowData
} from './types';
import { QueryFunctionContext } from '@tanstack/react-query';

export const accountingApi = {
  async getChartOfAccounts(): Promise<ChartOfAccount[]> {
    try {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .order('account_id');
      
      if (error) throw new Error(error.message);
      return data as ChartOfAccount[];
    } catch (error) {
      console.error('Get chart of accounts error:', error);
      throw error;
    }
  },

  async getFiscalPeriods(): Promise<FiscalPeriod[]> {
    try {
      const { data, error } = await supabase
        .from('fiscal_periods')
        .select('*')
        .order('start_date');
      
      if (error) throw new Error(error.message);
      return data as FiscalPeriod[];
    } catch (error) {
      console.error('Get fiscal periods error:', error);
      throw error;
    }
  },

  async getBalanceSheet({ queryKey }: QueryFunctionContext): Promise<BalanceSheetData> {
    const [, periodId] = queryKey as [string, number];
    
    try {
      const { data, error } = await supabase
        .rpc('generate_balance_sheet', { p_period_id: periodId });
      
      if (error) throw new Error(error.message);
      // Use a more explicit type assertion with intermediate step
      return data as unknown as BalanceSheetData;
    } catch (error) {
      console.error('Get balance sheet error:', error);
      throw error;
    }
  },

  async getProfitAndLoss({ queryKey }: QueryFunctionContext): Promise<ProfitLossData> {
    const [, periodId] = queryKey as [string, number];
    
    try {
      const { data, error } = await supabase
        .rpc('generate_profit_loss', { p_period_id: periodId });
      
      if (error) throw new Error(error.message);
      // Use a more explicit type assertion with intermediate step
      return data as unknown as ProfitLossData;
    } catch (error) {
      console.error('Get profit and loss error:', error);
      throw error;
    }
  },

  async getCashflow({ queryKey }: QueryFunctionContext): Promise<CashflowData> {
    const [, periodId] = queryKey as [string, number];
    
    try {
      const { data, error } = await supabase
        .rpc('generate_cashflow', { p_period_id: periodId });
      
      if (error) throw new Error(error.message);
      // Use a more explicit type assertion with intermediate step
      return data as unknown as CashflowData;
    } catch (error) {
      console.error('Get cashflow error:', error);
      throw error;
    }
  },

  async saveTransaction(transaction: Transaction, transactionLines: TransactionLine[]) {
    try {
      // First insert the transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('accounting_transactions')
        .insert(transaction)
        .select()
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
  
  async saveFinancialReport(report: FinancialReport) {
    try {
      const { data, error } = await supabase
        .from('financial_reports')
        .insert(report)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Save financial report error:', error);
      throw error;
    }
  }
};
