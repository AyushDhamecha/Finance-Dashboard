'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardCards } from '@/components/dashboard/cards';
import { DashboardCharts } from '@/components/dashboard/charts';
import { TransactionsView } from '@/components/transactions/view';
import { InsightsView } from '@/components/insights/view';
import { useHydration, useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'insights'>('overview');
  const hydrated = useHydration();
  const { timePeriod, setTimePeriod } = useStore();

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
          {(activeTab === 'overview' || activeTab === 'insights') && (
            <div className="flex gap-2 mb-6">
              {(['all', 'week', 'month'] as const).map((period) => (
                <Button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  variant={timePeriod === period ? 'default' : 'outline'}
                  size="sm"
                  className={`text-xs rounded-lg btn-subtle-scale ${timePeriod === period ? 'filter-btn-active' : 'filter-btn-inactive'}`}
                >
                  {period === 'all' ? 'All Time' : period === 'week' ? 'This Week' : 'This Month'}
                </Button>
              ))}
            </div>
          )}
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
