export type UserRole = 'viewer' | 'admin';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: 'salary' | 'food' | 'transport' | 'entertainment' | 'utilities' | 'other';
  amount: number;
  type: 'income' | 'expense';
}

export interface DashboardStats {
  balance: number;
  income: number;
  expenses: number;
  lastUpdated: string;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

export interface Insight {
  title: string;
  value: string;
  description: string;
  icon?: string;
  trend?: 'up' | 'down';
}
