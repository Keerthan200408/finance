export interface Transaction {
  _id?: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
  recurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface Budget {
  _id?: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  month: number;
  year: number;
  alertThreshold: number;
}

export interface Category {
  _id?: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  categoryBreakdown: CategorySpending[];
  monthlyTrends: MonthlyTrend[];
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}