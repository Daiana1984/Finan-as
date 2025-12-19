export type TransactionType = 'income' | 'fixed_expense' | 'variable_expense';

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  category?: string;
  date: string; // Added date for better tracking
}

export interface FinancialSummary {
  totalIncome: number;
  totalFixedExpense: number;
  totalVariableExpense: number;
  totalExpense: number;
  balance: number;
  savingsGoal: number;
  remainingAfterSavings: number;
  status: 'surplus' | 'balanced' | 'deficit' | 'danger';
}

export type AppTab = 'dashboard' | 'statement' | 'incomes' | 'fixed' | 'variable' | 'goals';