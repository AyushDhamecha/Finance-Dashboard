'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useState } from 'react';
import { Transaction, UserRole, DashboardStats } from '@/types';

interface StoreState {
  // State
  transactions: Transaction[];
  userRole: UserRole;
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
  timePeriod: 'all' | 'week' | 'month';

  // Actions
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setUserRole: (role: UserRole) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSortBy: (sortBy: 'date' | 'amount') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setTimePeriod: (period: 'all' | 'week' | 'month') => void;

  // Computed selectors
  getTimeFilteredTransactions: () => Transaction[];
  getFilteredAndSortedTransactions: () => Transaction[];
  getDashboardStats: () => DashboardStats;
  getCategorySpending: () => Array<{ category: string; amount: number; percentage: number }>;
  getSpendingTrend: () => { label: string; trend: 'up' | 'down' | 'stable' };
  getHighestCategory: () => { category: string; amount: number } | null;
  getSavingsRate: () => number;
  getBudgetHealth: () => { status: 'healthy' | 'warning' | 'critical'; message: string };
}

// Mock initial transactions
const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Monthly Salary',
    category: 'salary',
    amount: 5000,
    type: 'income',
  },
  {
    id: '2',
    date: '2024-01-18',
    description: 'Grocery Store',
    category: 'food',
    amount: 150,
    type: 'expense',
  },
  {
    id: '3',
    date: '2024-01-20',
    description: 'Gas',
    category: 'transport',
    amount: 50,
    type: 'expense',
  },
  {
    id: '4',
    date: '2024-01-22',
    description: 'Restaurant',
    category: 'food',
    amount: 75,
    type: 'expense',
  },
  {
    id: '5',
    date: '2024-01-25',
    description: 'Movie Tickets',
    category: 'entertainment',
    amount: 30,
    type: 'expense',
  },
  {
    id: '6',
    date: '2024-01-28',
    description: 'Electric Bill',
    category: 'utilities',
    amount: 120,
    type: 'expense',
  },
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
  // Initial state
  transactions: mockTransactions,
  userRole: 'viewer',
  searchQuery: '',
  selectedCategory: null,
  sortBy: 'date',
  sortOrder: 'desc',
  timePeriod: 'all',

  // Actions
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),
  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
  setUserRole: (role) => set({ userRole: role }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setTimePeriod: (period) => set({ timePeriod: period }),

  // Computed selectors
  getFilteredAndSortedTransactions: () => {
    const state = get();
    let filtered = state.transactions;

    // Apply time period filter
    if (state.timePeriod !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      if (state.timePeriod === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (state.timePeriod === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter((t) => new Date(t.date) >= startDate);
    }

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(query) || t.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (state.selectedCategory) {
      filtered = filtered.filter((t) => t.category === state.selectedCategory);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let compareValue = 0;
      if (state.sortBy === 'date') {
        compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        compareValue = a.amount - b.amount;
      }

      return state.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  },

  getTimeFilteredTransactions: () => {
    const state = get();
    let filtered = state.transactions;

    if (state.timePeriod !== 'all') {
      const now = new Date();
      const startDate = new Date();
      if (state.timePeriod === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (state.timePeriod === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }
      filtered = filtered.filter((t) => new Date(t.date) >= startDate);
    }

    return filtered;
  },

  getDashboardStats: () => {
    const state = get();
    const filtered = state.getTimeFilteredTransactions();
    const balance = filtered.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);

    const income = filtered
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expenses = filtered
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      balance,
      income,
      expenses,
      lastUpdated: new Date().toISOString(),
    };
  },

  getCategorySpending: () => {
    const state = get();
    const filtered = state.getTimeFilteredTransactions();
    const expenses = filtered.filter((t) => t.type === 'expense');

    const categoryMap = expenses.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    const total = Object.values(categoryMap).reduce((a, b) => a + b, 0);

    return Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }));
  },

  getSpendingTrend: () => {
    const state = get();
    const filtered = state.getTimeFilteredTransactions();
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthExpenses = filtered
      .filter((t) => t.type === 'expense' && new Date(t.date) >= lastMonth && new Date(t.date) < currentMonthStart)
      .reduce((acc, t) => acc + t.amount, 0);

    const currentMonthExpenses = filtered
      .filter((t) => t.type === 'expense' && new Date(t.date) >= currentMonthStart)
      .reduce((acc, t) => acc + t.amount, 0);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (currentMonthExpenses > lastMonthExpenses * 1.1) trend = 'up';
    else if (currentMonthExpenses < lastMonthExpenses * 0.9) trend = 'down';

    return {
      label: `${trend.charAt(0).toUpperCase() + trend.slice(1)} ${Math.abs(Math.round(((currentMonthExpenses - lastMonthExpenses) / Math.max(lastMonthExpenses, 1)) * 100))}%`,
      trend,
    };
  },

  getHighestCategory: () => {
    const state = get();
    const categorySpending = state.getCategorySpending();
    return categorySpending.length > 0 ? { category: categorySpending[0].category, amount: categorySpending[0].amount } : null;
  },

  getSavingsRate: () => {
    const state = get();
    const filtered = state.getTimeFilteredTransactions();
    const income = filtered
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expenses = filtered
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    return income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
  },

  getBudgetHealth: () => {
    const state = get();
    const savingsRate = state.getSavingsRate();

    if (savingsRate >= 20) {
      return { status: 'healthy', message: 'Great job! You are saving well.' };
    } else if (savingsRate >= 0) {
      return { status: 'warning', message: 'Try to increase your savings rate.' };
    } else {
      return { status: 'critical', message: 'Expenses exceed income. Review your budget.' };
    }
  },
}),
    {
      name: 'finance-dashboard-storage',
      partialize: (state: StoreState) => ({
        transactions: state.transactions.map(t => {
          if (t.attachment) {
            const { data, ...attachmentMeta } = t.attachment;
            return { ...t, attachment: { ...attachmentMeta, data: '' } };
          }
          return t;
        }),
        userRole: state.userRole,
        searchQuery: state.searchQuery,
        selectedCategory: state.selectedCategory,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        timePeriod: state.timePeriod,
      }),
    }
  )
);

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => unsub();
  }, []);

  return hydrated;
}
