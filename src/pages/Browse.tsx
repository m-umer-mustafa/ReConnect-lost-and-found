import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemCard } from '@/components/ItemCard';
import { useLostFound } from '@/context/LostFoundContext';
import type { FilterOptions } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const Browse: React.FC = () => {
  const { getPublicItems, submitClaim } = useLostFound();
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: '',
    location: '',
    dateFrom: '',
    dateTo: '',
    type: 'all',
    status: 'all',
  });

  const items = getPublicItems();

  const categories = [...new Set(items.map(item => item.category))];
  const locations = [...new Set(items.map(item => item.location))];

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch =
          item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm) ||
          item.location.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }
      if (filters.category && item.category !== filters.category) return false;
      if (filters.location && item.location !== filters.location) return false;
      if (filters.type !== 'all' && item.type !== filters.type) return false;
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      if (filters.dateFrom) {
        if (new Date(item.dateLostFound) < new Date(filters.dateFrom)) return false;
      }
      if (filters.dateTo) {
        if (new Date(item.dateLostFound) > new Date(filters.dateTo)) return false;
      }
      return true;
    });
  }, [items, filters]);

  const handleClaim = (itemId: string) => {
    /* Open your ClaimModal here; inside it call submitClaim(...) */
  };

  const clearFilters = () =>
    setFilters({
      search: '',
      category: '',
      location: '',
      dateFrom: '',
      dateTo: '',
      type: 'all',
      status: 'all',
    });

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== 'all');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Items</h1>
        <p className="text-muted-foreground">
          Search through {items.length} reported items to find what you're looking for
        </p>
      </div>

      {/* Filter bar etc... */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items, descriptions, categories..."
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date From</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={filters.category || 'all'}
                onValueChange={v => setFilters(prev => ({ ...prev, category: v === 'all' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={v =>
                  setFilters(prev => ({ ...prev, status: v as FilterOptions['status'] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="found">Found</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredItems.length} of {items.length} items
          {hasActiveFilters && ' (filtered)'}
        </p>
      </div>

      {filteredItems.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredItems.map(item => (
              <ItemCard item={item} onClaim={handleClaim} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters
              ? 'Try adjusting your filters to see more results'
              : 'No items have been reported yet. Be the first to help someone!'}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};