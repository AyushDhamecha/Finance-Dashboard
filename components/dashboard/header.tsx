'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Lightbulb, Moon, Sun, Wallet } from 'lucide-react';

interface DashboardHeaderProps {
  onTabChange: (tab: 'overview' | 'transactions' | 'insights') => void;
  activeTab: 'overview' | 'transactions' | 'insights';
}

export function DashboardHeader({ onTabChange, activeTab }: DashboardHeaderProps) {
  const { userRole, setUserRole } = useStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleRole = () => {
    setUserRole(userRole === 'viewer' ? 'admin' : 'viewer');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-40 shadow-md dark:shadow-orange-500/20">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
              <Wallet className="h-8 w-8 mr-2 text-primary" />
              Finance Dashboard
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm mt-1">
              {userRole === 'admin' ? 'Administrator View' : 'Viewer Mode'}
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {mounted && (
              <>
                <Button 
                  onClick={toggleTheme}
                  variant="outline"
                  size="icon"
                  className="rounded-xl btn-outline-orange btn-subtle-scale theme-toggle-btn"
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button 
                  onClick={toggleRole}
                  variant={userRole === 'admin' ? 'default' : 'outline'}
                  className={`text-xs flex-1 md:flex-initial rounded-xl btn-subtle-scale ${userRole !== 'admin' ? 'btn-outline-orange' : ''}`}
                >
                  {userRole === 'viewer' ? 'Switch to Admin' : 'Switch to Viewer'}
                </Button>
              </>
            )}
            {!mounted && (
              <>
                <Button 
                  variant="outline"
                  size="icon"
                  className="rounded-xl btn-outline-orange btn-subtle-scale theme-toggle-btn"
                  disabled
                >
                  <Moon className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline"
                  className="text-xs flex-1 md:flex-initial rounded-xl btn-subtle-scale btn-outline-orange"
                  disabled
                >
                  Switch to Admin
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => onTabChange('overview')}
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            className="flex items-center gap-2 text-xs md:text-sm rounded-xl btn-subtle-scale transition-all"
          >
            <BarChart3 className="w-3 md:w-4 h-3 md:h-4" />
            <span className="hidden sm:inline">Overview</span>
          </Button>
          <Button
            onClick={() => onTabChange('transactions')}
            variant={activeTab === 'transactions' ? 'default' : 'ghost'}
            className="flex items-center gap-2 text-xs md:text-sm rounded-xl btn-subtle-scale transition-all"
          >
            <TrendingUp className="w-3 md:w-4 h-3 md:h-4" />
            <span className="hidden sm:inline">Transactions</span>
          </Button>
          <Button
            onClick={() => onTabChange('insights')}
            variant={activeTab === 'insights' ? 'default' : 'ghost'}
            className="flex items-center gap-2 text-xs md:text-sm rounded-xl btn-subtle-scale transition-all"
          >
            <Lightbulb className="w-3 md:w-4 h-3 md:h-4" />
            <span className="hidden sm:inline">Insights</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
