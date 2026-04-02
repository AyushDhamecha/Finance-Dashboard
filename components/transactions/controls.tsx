'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

const CATEGORIES = ['salary', 'food', 'transport', 'entertainment', 'utilities', 'other'];

export function TransactionsControls() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    timePeriod,
    setTimePeriod,
  } = useStore();

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background"
        />
      </div>

      {/* Time Period Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'week', 'month'] as const).map((period) => (
          <Button
            key={period}
            onClick={() => setTimePeriod(period)}
            variant={timePeriod === period ? 'default' : 'outline'}
            size="sm"
            className={`text-xs rounded-lg btn-subtle-scale ${timePeriod === period ? 'filter-btn-active' : 'filter-btn-inactive'}`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Button>
        ))}
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-2">
        {/* Category Filter */}
        <div className="flex gap-1 flex-wrap">
          <Button
            onClick={() => setSelectedCategory(null)}
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            className={`text-xs rounded-lg btn-subtle-scale ${selectedCategory === null ? 'filter-btn-active' : 'filter-btn-inactive'}`}
          >
            All Categories
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              className={`text-xs rounded-lg btn-subtle-scale ${selectedCategory === cat ? 'filter-btn-active' : 'filter-btn-inactive'}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="ml-auto flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
            className="select-orange text-xs"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>

          <Button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            variant="outline"
            size="sm"
            className="text-xs rounded-lg btn-outline-orange btn-subtle-scale"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </Button>
        </div>
      </div>
    </div>
  );
}
