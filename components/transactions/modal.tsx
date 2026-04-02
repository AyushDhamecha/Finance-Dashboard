'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '@/lib/store';
import { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const transactionSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required').max(100, 'Description must be less than 100 characters'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be greater than 0'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const CATEGORIES = ['salary', 'food', 'transport', 'entertainment', 'utilities', 'other'] as const;

export function TransactionModal({ transaction, onClose }: TransactionModalProps) {
  const { addTransaction, updateTransaction } = useStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: transaction?.date || new Date().toISOString().split('T')[0],
      description: transaction?.description || '',
      category: transaction?.category || 'other',
      amount: transaction?.amount || 0,
      type: transaction?.type || 'expense',
    },
  });

  useEffect(() => {
    reset({
      date: transaction?.date || new Date().toISOString().split('T')[0],
      description: transaction?.description || '',
      category: transaction?.category || 'other',
      amount: transaction?.amount || 0,
      type: transaction?.type || 'expense',
    });
  }, [transaction, reset]);

  const onSubmit = (data: TransactionFormData) => {
    try {
      if (transaction) {
        updateTransaction(transaction.id, {
          ...data,
          amount: Number(data.amount),
        });
        toast.success('Transaction updated successfully');
      } else {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          ...data,
          amount: Number(data.amount),
        };
        addTransaction(newTransaction);
        toast.success('Transaction added successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save transaction');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4 fade-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <Input
              type="date"
              {...register('date')}
              className="bg-background"
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              type="text"
              {...register('description')}
              placeholder="e.g., Grocery Store"
              className="bg-background"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              {...register('type')}
              className="select-orange w-full"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              {...register('category')}
              className="select-orange w-full"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <Input
              type="number"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="bg-background"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1 rounded-lg btn-outline-orange btn-subtle-scale">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-lg btn-subtle-scale">
              {transaction ? 'Update' : 'Add'} Transaction
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
