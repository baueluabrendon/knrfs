
import { supabase } from '@/integrations/supabase/client';

interface AIAssistantResponse {
  message: string;
  error?: string;
}

export interface ForecastParams {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  loanType?: string;
  startDate?: string;
  endDate?: string;
}

export interface AccountingParams {
  reportType: 'summary' | 'pnl' | 'reconciliation';
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
}

export const aiApi = {
  async chatWithAssistant(messages: any[], context: string = 'loan management'): Promise<AIAssistantResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-loan-assistant', {
        body: { messages, context }
      });
      
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw error;
    }
  },

  async generateForecast(params: ForecastParams, additionalContext: any = {}): Promise<AIAssistantResponse> {
    try {
      const contextData = {
        ...params,
        ...additionalContext
      };

      const { data, error } = await supabase.functions.invoke('ai-loan-assistant', {
        body: {
          messages: [
            { role: 'user', content: `Generate a forecast report for repayments with timeframe: ${params.timeframe}.` }
          ],
          context: JSON.stringify(contextData),
          endpoint: 'forecast-repayments'
        }
      });
      
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Forecast Generation Error:', error);
      throw error;
    }
  },

  async generateAccountingReport(params: AccountingParams, accountingData: any): Promise<AIAssistantResponse> {
    try {
      const endpoint = params.reportType === 'pnl' 
        ? 'pnl-statement' 
        : params.reportType === 'reconciliation'
          ? 'bank-reconciliation'
          : 'accounting-summary';

      const requestMessage = `Generate a ${params.reportType} report for the ${params.timeframe} period${
        params.startDate ? ` from ${params.startDate}` : ''
      }${
        params.endDate ? ` to ${params.endDate}` : ''
      }.`;

      const { data, error } = await supabase.functions.invoke('ai-loan-assistant', {
        body: {
          messages: [{ role: 'user', content: requestMessage }],
          context: JSON.stringify(accountingData),
          endpoint
        }
      });
      
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Accounting Report Error:', error);
      throw error;
    }
  }
};
