'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardCards } from '@/components/dashboard/cards';
import { DashboardCharts } from '@/components/dashboard/charts';
import { TransactionsView } from '@/components/transactions/view';
import { InsightsView } from '@/components/insights/view';
import { useHydration } from '@/lib/store';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'insights'>('overview');
  const hydrated = useHydration();

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader onTabChange={setActiveTab} activeTab={activeTab} />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="fade-in">
          {activeTab === 'overview' && (
            <>
              <DashboardCards />
              <DashboardCharts />
            </>
          )}
          {activeTab === 'transactions' && <TransactionsView />}
          {activeTab === 'insights' && <InsightsView />}
        </div>
      </div>
    </main>
  );
}
