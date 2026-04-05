'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, Target, PieChart as PieChartIcon, TrendingDown, CheckCircle } from 'lucide-react';

export function InsightsView() {
  const { getDashboardStats, getCategorySpending, getTimeFilteredTransactions, getSpendingTrend, getHighestCategory, getSavingsRate, getBudgetHealth } = useStore();
  const stats = getDashboardStats();
  const categorySpending = getCategorySpending();
  const transactions = getTimeFilteredTransactions();
  const spendingTrend = getSpendingTrend();
  const highestCategory = getHighestCategory();
  const savingsRateValue = getSavingsRate();
  const budgetHealth = getBudgetHealth();

  const insights = useMemo(() => {
    const avgTransaction =
      transactions.length > 0
        ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
        : 0;

    const topCategory = categorySpending[0];
    const incomeTransactions = transactions.filter((t) => t.type === 'income');
    const expenseTransactions = transactions.filter((t) => t.type === 'expense');

    return [
      {
        title: 'Average Transaction',
        value: `$${Math.round(avgTransaction)}`,
        description: 'Average transaction amount',
        icon: TrendingUp,
        trend: 'neutral' as const,
      },
      {
        title: 'Income Transactions',
        value: incomeTransactions.length.toString(),
        description: 'Total income entries',
        icon: TrendingUp,
        trend: incomeTransactions.length > 0 ? 'up' : 'neutral',
      },
      {
        title: 'Expense Transactions',
        value: expenseTransactions.length.toString(),
        description: 'Total expense entries',
        icon: AlertCircle,
        trend: 'neutral',
      },
      {
        title: 'Top Spending Category',
        value: topCategory ? topCategory.category.toUpperCase() : 'N/A',
        description: topCategory ? `$${Math.round(topCategory.amount)} spent` : 'No expenses yet',
        icon: PieChartIcon,
        trend: 'neutral',
      },
    ];
  }, [transactions, categorySpending]);

  const savingsRate = useMemo(() => {
    if (stats.income === 0) return 0;
    return Math.round((stats.balance / stats.income) * 100);
  }, [stats]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <Card key={index} className="border border-border card-hover slide-in-up rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {insight.title}
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{insight.value}</div>
                <p className="text-xs text-muted-foreground mt-2">{insight.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Micro-Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border card-hover slide-in-up rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Spending Trend</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                {spendingTrend.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-red-600" />
                ) : spendingTrend.trend === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Target className="w-4 h-4 text-primary" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{spendingTrend.label}</div>
            <p className="text-xs text-muted-foreground mt-2">vs last month</p>
          </CardContent>
        </Card>

        <Card className="border border-border card-hover slide-in-up rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Category</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <PieChartIcon className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground capitalize">
              {highestCategory ? highestCategory.category : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ${highestCategory ? highestCategory.amount.toLocaleString() : '0'} spent
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border card-hover slide-in-up rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Savings Rate</CardTitle>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{savingsRateValue}%</div>
            <p className="text-xs text-muted-foreground mt-2">of income saved</p>
          </CardContent>
        </Card>

        <Card className="border border-border card-hover slide-in-up rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Budget Health</CardTitle>
              <div className={`p-2 rounded-lg ${budgetHealth.status === 'healthy' ? 'bg-emerald-50 dark:bg-emerald-950' : budgetHealth.status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950' : 'bg-red-50 dark:bg-red-950'}`}>
                {budgetHealth.status === 'healthy' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : budgetHealth.status === 'warning' ? (
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-sm font-semibold capitalize`}>
              {budgetHealth.status}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{budgetHealth.message}</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-border card-hover slide-in-up rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Spending Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorySpending.length > 0 ? (
              categorySpending.map((category) => (
                <div key={category.category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium capitalize">
                      {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                    </span>
                    <span className="text-sm font-semibold">{category.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ${category.amount.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No expense data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border card-hover slide-in-up rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Total Income</span>
                <span className="font-semibold text-green-600">
                  ${stats.income.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Total Expenses</span>
                <span className="font-semibold text-red-600">
                  ${stats.expenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Current Balance</span>
                <span className={`font-semibold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${stats.balance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-muted-foreground">Savings Rate</span>
                <span className="font-semibold">{savingsRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
