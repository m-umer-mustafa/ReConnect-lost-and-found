// src/pages/Browse.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ItemCard } from '@/components/ItemCard';
import { ClaimModal } from '@/components/ClaimModal';
import type { FilterOptions, LostFoundItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useLostFound } from '@/context/LostFoundContext';

const defaultImage = "https://via.placeholder.com/400x160/343434/FFFFFF?text=No+Image";

/* ---------- helpers ---------- */
const mapRow = (row: any): LostFoundItem => ({
  ...row,
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  location: row.location,
  dateLostFound: row.date_lost_found,
  dateReported: row.date_reported,
  status: row.status,
  type: row.type,
  images: row.images ?? [],
  userId: row.user_id,
  userEmail: row.user_email,
  userName: row.user_name,
  contactEmail: row.contact_email,
  contactPhone: row.contact_phone,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const Browse: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: '',
    location: '',
    dateFrom: '',
    dateTo: '',
    type: 'all',
    status: 'all',
  });

  const fetchItems = async () => {
    const { data } = await supabase.from("items").select("*");
    setItems(data);
  };

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);

  /* ---------- load items ---------- */
  useEffect(() => {
    const load = async () => {
      let query = supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.type !== 'all') query = query.eq('type', filters.type);
      if (filters.status !== 'all') query = query.eq('status', filters.status);
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.location)
        query = query.ilike('location', `%${filters.location}%`);
      if (filters.dateFrom)
        query = query.gte('date_lost_found', filters.dateFrom);
      if (filters.dateTo) query = query.lte('date_lost_found', filters.dateTo);

      const { data } = await query;
      setItems((data ?? []).map(mapRow));
    };
    load();
  }, [filters]);

  /* ---------- client-side search ---------- */
  const filteredItems = useMemo(() => {
    if (!filters.search) return items;
    const term = filters.search.toLowerCase();
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(term) ||
        i.description.toLowerCase().includes(term) ||
        i.category.toLowerCase().includes(term) ||
        i.location.toLowerCase().includes(term)
    );
  }, [items, filters.search]);

  /* ---------- helpers ---------- */
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

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== '' && v !== 'all'
  );

  const handleClaim = (item: LostFoundItem) => {
    setSelectedItem(item);
    setShowClaimModal(true);
    fetchItems();
  };

  const handleClaimSubmit = async (
    reason: string,
    uniqueIdentifiers: string
  ) => {
    if (!user || !selectedItem) return;

    try {
      await supabase.from('claims').insert({
        item_id: selectedItem.id,
        claimer_id: user.id,
        claimer_email: user.email,
        claimer_name: user.user_metadata?.full_name,
        reason,
        unique_identifiers: uniqueIdentifiers,
      });

      await supabase.from('notifications').insert({
        user_id: selectedItem.userId,
        title: 'New claim on your item',
        body: `${
          user.user_metadata?.full_name || user.email
        } claimed “${selectedItem.title}”.`,
      });

      toast({
        title: 'Claim Sent',
        description: 'Your claim has been submitted successfully.',
        variant: 'default',
      });

      setShowClaimModal(false);
      setSelectedItem(null);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Something went wrong while sending your claim.',
        variant: 'destructive',
      });
    }
    window.location.reload();
  };

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category))],
    [items]
  );
  const locations = useMemo(
    () => [...new Set(items.map((i) => i.location))],
    [items]
  );

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Items</h1>
          <p className="text-muted-foreground">
            Search through {items.length} reported items
          </p>
        </div>

        {/* filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items, descriptions, categories..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Date From
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateFrom: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Category
                </label>
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(v) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: v === 'all' ? '' : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
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
                  onValueChange={(v) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: v as FilterOptions['status'],
                    }))
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
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" /> Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* results */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredItems.length} of {items.length} items
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>

        {filteredItems.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={{
                  ...item,
                  images:
                    item.images.length > 0
                      ? item.images
                      : [defaultImage],
                }}
                onClaim={() => handleClaim(item)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'No items have been reported yet'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Claim Modal (portal-friendly) */}
      <ClaimModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onSubmit={handleClaimSubmit}
        item={selectedItem}
      />
    </>
  );
};