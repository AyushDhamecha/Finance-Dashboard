'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '@/lib/store';
import { Transaction, TransactionAttachment } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, FileText, Image, Loader2, Sparkles } from 'lucide-react';
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
  const [attachment, setAttachment] = useState<TransactionAttachment | null>(
    transaction?.attachment || null
  );
  const [isScanning, setIsScanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
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
          attachment: attachment || undefined,
        });
        toast.success('Transaction updated successfully');
      } else {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          ...data,
          amount: Number(data.amount),
          attachment: attachment || undefined,
        };
        addTransaction(newTransaction);
        toast.success('Transaction added successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save transaction');
    }
  };

  const compressImage = (file: File, maxWidth = 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (file.type === 'application/pdf') {
          const result = e.target?.result as string;
          resolve(result.split(',')[1]);
          return;
        }
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl.split(',')[1]);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, WebP image or PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsScanning(true);
    try {
      // Compress image (or just convert PDF to base64)
      const base64 = await compressImage(file);
      const mimeType = file.type === 'application/pdf' ? 'application/pdf' : 'image/jpeg';

      setAttachment({ name: file.name, type: file.type, data: '' });

      const response = await fetch('/api/parse-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData: base64, mimeType }),
      });

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        toast.error(errorResult.error || `Scan failed (${response.status}). Fill details manually.`);
        return;
      }

      const result = await response.json();

      // Auto-fill form fields
      if (result.date) setValue('date', result.date, { shouldValidate: true, shouldDirty: true });
      if (result.description) setValue('description', result.description, { shouldValidate: true, shouldDirty: true });
      if (result.category) setValue('category', result.category, { shouldValidate: true, shouldDirty: true });
      if (result.type) setValue('type', result.type, { shouldValidate: true, shouldDirty: true });
      if (result.amount > 0) setValue('amount', result.amount, { shouldValidate: true, shouldDirty: true });

      toast.success('Receipt scanned! Fields auto-filled.');
    } catch (err) {
      console.error('Receipt scan error:', err);
      toast.error('Failed to scan receipt. You can still fill in the details manually.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4 fade-in max-h-[90vh] overflow-y-auto">
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
          {/* File Upload / Receipt Scanner */}
          {!transaction && (
            <div>
              <label className="block text-sm font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Scan Receipt / Invoice
                </span>
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : attachment
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />

                {isScanning ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Scanning with AI...</p>
                  </div>
                ) : attachment ? (
                  <div className="flex items-center gap-3">
                    {attachment.type === 'application/pdf' ? (
                      <FileText className="w-8 h-8 text-primary shrink-0" />
                    ) : (
                      <Image className="w-8 h-8 text-primary shrink-0" />
                    )}
                    <div className="text-left min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">Fields auto-filled from scan</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttachment(null);
                      }}
                      className="ml-auto text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Drop a receipt image or PDF here, or <span className="text-primary font-medium">browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP, PDF up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
            <Button type="submit" className="flex-1 rounded-lg btn-subtle-scale" disabled={isScanning}>
              {transaction ? 'Update' : 'Add'} Transaction
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
