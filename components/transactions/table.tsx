'use client';

import { useStore } from '@/lib/store';
import { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface TransactionsTableProps {
  onEditTransaction: (transaction: Transaction) => void;
}

export function TransactionsTable({ onEditTransaction }: TransactionsTableProps) {
  const { getFilteredAndSortedTransactions, deleteTransaction, userRole } = useStore();
  const transactions = getFilteredAndSortedTransactions();

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast.success('Transaction deleted successfully');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      salary: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      food: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      utilities: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Date</th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Description</th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Category</th>
                <th className="px-6 py-3 text-right font-semibold text-foreground">Amount</th>
                <th className="px-6 py-3 text-center font-semibold text-foreground">Type</th>
                {userRole === 'admin' && (
                  <th className="px-6 py-3 text-right font-semibold text-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="table-row-hover">
                  <td className="px-6 py-4 text-foreground">{formatDate(transaction.date)}</td>
                  <td className="px-6 py-4 text-foreground">{transaction.description}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(transaction.category)}`}
                    >
                      {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                  </td>
                  {userRole === 'admin' && (
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        onClick={() => onEditTransaction(transaction)}
                        size="sm"
                        variant="outline"
                        className="inline-flex items-center gap-1 rounded-lg btn-outline-orange btn-subtle-scale"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(transaction.id)}
                        size="sm"
                        variant="destructive"
                        className="inline-flex items-center gap-1 rounded-lg btn-subtle-scale"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-12 text-center text-muted-foreground">
          <p>No transactions found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
