'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function DashboardCharts() {
  const { getTimeFilteredTransactions } = useStore();
  const transactions = getTimeFilteredTransactions();

  // Prepare balance trend data
  const balanceTrendData = useMemo(() => {
    const grouped = transactions.reduce(
      (acc, t) => {
        const dateKey = new Date(t.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        if (!acc[dateKey]) {
          acc[dateKey] = { date: dateKey, balance: 0 };
        }
        acc[dateKey].balance += t.type === 'income' ? t.amount : -t.amount;
        return acc;
      },
      {} as Record<string, { date: string; balance: number }>
    );

    let runningBalance = 0;
    return Object.values(grouped)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item) => {
        runningBalance += item.balance;
        return { ...item, balance: runningBalance };
      });
  }, [transactions]);

  // Prepare category spending data
  const categoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.type === 'expense') {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      }
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [transactions]);

  /* Warm orange-based color palette */
  const colors = ['#f97316', '#fb923c', '#fbbf24', '#a3e635', '#86efac', '#059669'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border border-border card-hover slide-in-up">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Balance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={balanceTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--foreground)',
                }}
                formatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ fill: '#f97316', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border border-border card-hover slide-in-up">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    color: 'var(--foreground)',
                  }}
                  formatter={(value) => `$${Number(value).toLocaleString()}`} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No expense data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
