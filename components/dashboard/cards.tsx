'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';

export function DashboardCards() {
  const { getDashboardStats } = useStore();
  const stats = getDashboardStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="border border-border card-hover slide-in-up rounded-2xl bg-gradient-to-br from-card to-background">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            Balance
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(stats.balance)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Total account balance</p>
        </CardContent>
      </Card>

      <Card className="border border-border card-hover slide-in-up rounded-2xl bg-gradient-to-br from-card to-background">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            Income
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(stats.income)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Total income</p>
        </CardContent>
      </Card>

      <Card className="border border-border card-hover slide-in-up rounded-2xl bg-gradient-to-br from-card to-background">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            Expenses
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950">
              <ArrowDownLeft className="w-4 h-4 text-red-600" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(stats.expenses)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Total expenses</p>
        </CardContent>
      </Card>
    </div>
  );
}
