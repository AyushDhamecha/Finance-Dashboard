'use client';

import { useState } from 'react';
import { TransactionsTable } from './table';
import { TransactionsControls } from './controls';
import { TransactionModal } from './modal';
import { useStore } from '@/lib/store';
import { Transaction } from '@/types';

export function TransactionsView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { userRole } = useStore();

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    if (userRole === 'admin') {
      setEditingTransaction(transaction);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transactions</h2>
        {userRole === 'admin' && (
          <button
            onClick={handleAddTransaction}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            + Add Transaction
          </button>
        )}
      </div>

      <TransactionsControls />
      <TransactionsTable onEditTransaction={handleEditTransaction} />

      {isModalOpen && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
