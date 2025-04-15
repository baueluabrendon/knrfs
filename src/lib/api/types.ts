
// Types for accounting module
export interface ChartOfAccount {
  account_id: string;
  account_name: string;
  account_type: string;
  account_category: string;
  description?: string;
  is_active: boolean;
}

export interface FiscalPeriod {
  period_id: number;
  period_name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
}

export interface Transaction {
  transaction_id?: string;
  transaction_date: string;
  transaction_type: string;
  description?: string;
  reference_number?: string;
}

export interface TransactionLine {
  line_id?: string;
  transaction_id: string;
  account_id: string;
  description?: string;
  debit_amount: number;
  credit_amount: number;
}

export interface FinancialReport {
  report_id?: string;
  report_type: 'balance_sheet' | 'profit_loss' | 'cashflow';
  period_id: number;
  report_data: any;
  notes?: string;
}

