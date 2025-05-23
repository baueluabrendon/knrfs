
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

export interface AssetLiabilityItem {
  name: string;
  amount: number;
}

export interface RevenueExpenseItem {
  category: string;
  name: string;
  amount: number;
}

export interface CashflowItem {
  name: string;
  amount: number;
}

export interface BalanceSheetData {
  assets: AssetLiabilityItem[];
  liabilities: AssetLiabilityItem[];
  equity: AssetLiabilityItem[];
  period?: {
    start_date: string;
    end_date: string;
  };
}

export interface ProfitLossData {
  revenue: RevenueExpenseItem[];
  expenses: RevenueExpenseItem[];
  period?: {
    start_date: string;
    end_date: string;
  };
}

export interface CashflowData {
  operating: CashflowItem[];
  investing: CashflowItem[];
  financing: CashflowItem[];
  period?: {
    start_date: string;
    end_date: string;
  };
}

export interface FinancialReport {
  report_id?: string;
  report_type: 'balance_sheet' | 'profit_loss' | 'cashflow';
  period_id: number;
  report_data: any;
  notes?: string;
}

// General API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
