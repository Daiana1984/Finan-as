export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  category?: string; // Optional for simple MVP
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsGoal: number;
  remainingAfterSavings: number;
  status: 'surplus' | 'balanced' | 'deficit' | 'danger';
}

export interface AiAdviceResponse {
  advice: string;
  tips: string[];
}