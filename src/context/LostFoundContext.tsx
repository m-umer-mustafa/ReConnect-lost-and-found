import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { LostFoundItem, Claim, LostFoundState } from '@/lib/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabaseClient';

interface LostFoundContextType extends LostFoundState {
  addItem: (item: Omit<LostFoundItem, 'id' | 'userId' | 'userEmail' | 'userName' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<LostFoundItem>) => void;
  deleteItem: (id: string) => void;
  submitClaim: (itemId: string, claim: Omit<Claim, 'id' | 'claimerId' | 'claimer' | 'status' | 'createdAt'>) => void;
  respondToClaim: (claimId: string, status: 'approved' | 'rejected') => void;
  removeClaim: (claimId: string) => void;
  markItemAsReunited: (itemId: string, claimId: string) => Promise<boolean>;

  getUserItems: () => LostFoundItem[];
  getUserClaims: () => Claim[];
  getClaimsForUserItems: () => Claim[];
  getPublicItems: () => LostFoundItem[];

  fetchUserItems: () => Promise<void>;
  fetchUserClaims: () => Promise<void>;
  fetchClaimsForUserItems: (userItems: LostFoundItem[]) => Promise<void>;
}

const LostFoundContext = createContext<LostFoundContextType | undefined>(undefined);

export const useLostFound = () => {
  const context = useContext(LostFoundContext);
  if (context === undefined) {
    throw new Error('useLostFound must be used within a LostFoundProvider');
  }
  return context;
};

/* ---------- Utility mappers ---------- */
const mapSupabaseItem = (row: any): LostFoundItem => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  location: row.location,
  dateReported: row.date_reported || row.dateReported,
  dateLostFound: row.date_lost_found || row.dateLostFound,
  status: row.status,
  type: row.type,
  images: row.images ?? [],
  userId: row.user_id || row.userId,
  userEmail: row.user_email || row.userEmail,
  userName: row.user_name || row.userName,
  contactEmail: row.contact_email || row.contactEmail,
  contactPhone: row.contact_phone || row.contactPhone,
  createdAt: row.created_at || row.createdAt,
  updatedAt: row.updated_at || row.updatedAt,
});

const mapSupabaseClaim = (row: any): Claim => ({
  id: row.id,
  itemId: row.item_id,
  claimerId: row.claimer_id,
  claimer: { email: row.claimer_email, name: row.claimer_name },
  reason: row.reason,
  uniqueIdentifiers: row.unique_identifiers,
  status: row.status,
  createdAt: row.created_at,
  respondedAt: row.responded_at,
});

export const LostFoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<LostFoundState>({
    items: [],
    claims: [],
    loading: false,
    error: null,
  });

  // Refs to track loading states and prevent duplicate requests
  const isLoadingUserItems = useRef(false);
  const isLoadingUserClaims = useRef(false);
  const isLoadingClaimsForUserItems = useRef(false);
  const lastFetchUserItems = useRef(0);
  const lastFetchUserClaims = useRef(0);
  const lastFetchClaimsForUserItems = useRef(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  useEffect(() => {
    (async () => {
      setState((s) => ({ ...s, loading: true }));
      await Promise.all([loadItems(), loadClaims()]);
      setState((s) => ({ ...s, loading: false }));
    })();
  }, [user]);

  /* ---------- Existing loaders ---------- */
  const loadItems = async () => {
    const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setState((s) => ({ ...s, items: (data ?? []).map(mapSupabaseItem) }));
  };

  const loadClaims = async () => {
    const { data, error } = await supabase.from('claims').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setState((s) => ({ ...s, claims: (data ?? []).map(mapSupabaseClaim) }));
  };

  /* ---------- New fetch functions for user-specific data ---------- */

  const fetchUserItems = useCallback(async () => {
    if (!user) return;
    
    // Prevent duplicate requests
    const now = Date.now();
    if (isLoadingUserItems.current || (now - lastFetchUserItems.current < CACHE_DURATION)) {
      return;
    }
    
    isLoadingUserItems.current = true;
    
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('fetchUserItems error:', error);
        return;
      }
      
      // Replace all items of this user with fresh data
      setState((s) => ({
        ...s,
        items: [
          ...s.items.filter(i => i.userId !== user.id), // keep items of other users
          ...data.map(mapSupabaseItem), // fresh items of current user
        ],
      }));
      
      lastFetchUserItems.current = now;
    } finally {
      isLoadingUserItems.current = false;
    }
  }, [user]);

  const fetchUserClaims = useCallback(async () => {
    if (!user) return;
    
    // Prevent duplicate requests
    const now = Date.now();
    if (isLoadingUserClaims.current || (now - lastFetchUserClaims.current < CACHE_DURATION)) {
      return;
    }
    
    isLoadingUserClaims.current = true;
    
    try {
      // Fetch claims with their associated items
      const { data: claimsData, error: claimsError } = await supabase
        .from('claims')
        .select(`
          *,
          items!inner(*)
        `)
        .eq('claimer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (claimsError) {
        console.error('fetchUserClaims error:', claimsError);
        return;
      }
      
      // Map claims and add associated items to the state
      const claims = claimsData?.map((row: any) => {
        const claim = mapSupabaseClaim(row);
        if (row.items) {
          // Add the associated item to the items state
          const item = mapSupabaseItem(row.items);
          setState((s) => {
            const existingItemIndex = s.items.findIndex(i => i.id === item.id);
            if (existingItemIndex === -1) {
              return { ...s, items: [...s.items, item] };
            }
            return s;
          });
        }
        return claim;
      }) || [];
      
      // Replace claims made by this user with fresh data
      setState((s) => ({
        ...s,
        claims: [
          ...s.claims.filter(c => c.claimerId !== user.id),
          ...claims,
        ],
      }));
      
      lastFetchUserClaims.current = now;
    } finally {
      isLoadingUserClaims.current = false;
    }
  }, [user]);

  const fetchClaimsForUserItems = useCallback(async (userItems: LostFoundItem[]) => {
    if (!user) return;
    
    const userItemIds = userItems.map(i => i.id);
    if (userItemIds.length === 0) return;

    // Prevent duplicate requests
    const now = Date.now();
    const cacheKey = userItemIds.sort().join(',');
    const lastCacheKey = useRef('');
    
    if (isLoadingClaimsForUserItems.current || 
        (now - lastFetchClaimsForUserItems.current < CACHE_DURATION && 
         lastCacheKey.current === cacheKey)) {
      return;
    }
    
    isLoadingClaimsForUserItems.current = true;
    lastCacheKey.current = cacheKey;
    
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .in('item_id', userItemIds)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('fetchClaimsForUserItems error:', error);
        return;
      }

      setState((s) => ({
        ...s,
        claims: [...s.claims.filter(c => !userItemIds.includes(c.itemId)), ...data.map(mapSupabaseClaim)],
      }));
      
      lastFetchClaimsForUserItems.current = now;
    } finally {
      isLoadingClaimsForUserItems.current = false;
    }
  }, [user]);

  /* ---------- Existing functions and selectors, unchanged ---------- */
  const addItem = async (itemData: Omit<LostFoundItem, 'id' | 'userId' | 'userEmail' | 'userName' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const { data } = await supabase
      .from('items')
      .insert({ ...itemData, user_id: user.id, user_email: user.email, user_name: user.user_metadata?.full_name })
      .select()
      .single();
    
    if (data) {
      setState((s) => ({ ...s, items: [mapSupabaseItem(data), ...s.items] }));
      
      // Refresh data to ensure UI is updated
      await Promise.all([loadItems(), loadClaims()]);
    }
  };

  const toSnakeCaseKeys = (obj: any) => {
    const newObj: any = {};
    Object.entries(obj).forEach(([key, val]) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      newObj[snakeKey] = val;
    });
    return newObj;
  };

  const updateItem = async (id: string, updates: Partial<LostFoundItem>) => {
    const updatesSnake = toSnakeCaseKeys(updates);

    const { data, error } = await supabase
      .from('items')
      .update({ ...updatesSnake, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update item error:', error);
      return;
    }

    if (data) {
      setState((s) => ({
        ...s,
        items: s.items.map((i) => (i.id === id ? mapSupabaseItem(data) : i)),
      }));

      // Refresh data if needed
      await Promise.all([loadItems(), loadClaims()]);
    }
  };


  const deleteItem = async (id: string) => {
    await supabase.from('items').delete().eq('id', id);
    setState((s) => ({
      ...s,
      items: s.items.filter((i) => i.id !== id),
      claims: s.claims.filter((c) => c.itemId !== id),
    }));
    
    // Refresh data to ensure UI is updated
    await Promise.all([loadItems(), loadClaims()]);
  };

  const submitClaim = async (
    itemId: string,
    claimData: Omit<Claim, 'id' | 'claimerId' | 'claimer' | 'status' | 'createdAt'>
  ) => {
    if (!user) return;
    const { data } = await supabase
      .from('claims')
      .insert({
        item_id: itemId,
        claimer_id: user.id,
        claimer_email: user.email,
        claimer_name: user.user_metadata?.full_name,
        reason: claimData.reason,
        unique_identifiers: claimData.uniqueIdentifiers,
        status: 'pending',
      })
      .select()
      .single();
    
    if (data) {
      // Update local state
      setState((s) => ({ ...s, claims: [mapSupabaseClaim(data), ...s.claims] }));
      
      // Refresh data to ensure UI is updated
      await Promise.all([loadItems(), loadClaims()]);
    }
  };

  const respondToClaim = async (claimId: string, status: 'approved' | 'rejected') => {
    const { data: updatedClaim } = await supabase
      .from('claims')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('id', claimId)
      .select()
      .single();

    if (!updatedClaim) return;

    // Get the item details for notification
    const item = state.items.find(i => i.id === updatedClaim.item_id);
    if (!item) {
      console.error('Item not found for claim notification');
      return;
    }

    // Send notification to the claimer
    const notificationTitle = status === 'approved' ? 'Claim Approved!' : 'Claim Rejected';
    const notificationBody = status === 'approved'
      ? `Your claim for "${item.title}" has been approved! The item owner will contact you to arrange the return.`
      : `Your claim for "${item.title}" has been rejected. The item owner decided this wasn't a match.`;

    await supabase.from('notifications').insert({
      user_id: updatedClaim.claimer_id,
      title: notificationTitle,
      body: notificationBody,
      read: false,
      created_at: new Date().toISOString()
    });

    if (status === 'approved') {
      await supabase
        .from('items')
        .update({ status: 'claimed', updated_at: new Date().toISOString() })
        .eq('id', updatedClaim.item_id);

      // Send rejection notifications to other pending claimers
      const { data: otherClaims } = await supabase
        .from('claims')
        .select('*')
        .eq('item_id', updatedClaim.item_id)
        .neq('id', claimId)
        .eq('status', 'pending');

      if (otherClaims && otherClaims.length > 0) {
        const rejectionNotifications = otherClaims.map(claim => ({
          user_id: claim.claimer_id,
          title: 'Claim Rejected',
          body: `Your claim for "${item.title}" has been rejected as another claim was approved.`,
          read: false,
          created_at: new Date().toISOString()
        }));

        await supabase.from('notifications').insert(rejectionNotifications);
      }

      await supabase
        .from('claims')
        .update({ status: 'rejected', responded_at: new Date().toISOString() })
        .eq('item_id', updatedClaim.item_id)
        .neq('id', claimId)
        .eq('status', 'pending');
    }

    await Promise.all([loadItems(), loadClaims()]);
  };

  const removeClaim = async (claimId: string) => {
    if (!user) return;

    const claim = state.claims.find((c) => c.id === claimId && c.claimerId === user.id);
    if (!claim) return;

    // Delete from DB
    const { error } = await supabase.from('claims').delete().eq('id', claimId);
    if (error) {
      console.error('Error deleting claim:', error);
      return;
    }

    // Update local state after deletion
    setState((s) => ({
      ...s,
      claims: s.claims.filter((c) => c.id !== claimId),
    }));

    // Check if no more pending claims for that item
    if (claim.status === 'pending') {
      const remainingPendingClaims = state.claims.filter(
        (c) => c.itemId === claim.itemId && c.status === 'pending' && c.id !== claimId
      );

      if (remainingPendingClaims.length === 0) {
        // Reset item status to its original type (lost/found)
        const item = state.items.find((i) => i.id === claim.itemId);
        if (item) {
          await supabase
            .from('items')
            .update({ status: item.type, updated_at: new Date().toISOString() })
            .eq('id', item.id);

          // Update item in local state as well
          setState((s) => ({
            ...s,
            items: s.items.map((i) =>
              i.id === item.id ? { ...i, status: item.type } : i
            ),
          }));
        }
      }
    }
    
    // Refresh data to ensure UI is updated
    await Promise.all([loadItems(), loadClaims()]);
  };

  const markItemAsReunited = async (itemId: string, claimId: string) => {
    if (!user) return;

    try {
      // Get the item details first
      const item = state.items.find(i => i.id === itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      // Get all claims for this item (not just the approved one)
      const { data: allClaims, error: claimsError } = await supabase
        .from('claims')
        .select('*')
        .eq('item_id', itemId);

      if (claimsError) {
        console.error('Error fetching claims:', claimsError);
        throw claimsError;
      }

      // Create notifications for all claimers
      const notifications = allClaims?.map(claim => ({
        user_id: claim.claimer_id,
        title: 'Item Reunited',
        body: `The item "${item.title}" you claimed has been reunited with its owner and is no longer available.`,
        read: false,
        created_at: new Date().toISOString()
      })) || [];

      if (notifications.length > 0) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notificationError) {
          console.error('Error creating notifications:', notificationError);
          // Continue with deletion even if notifications fail
        }
      }

      // Delete all claims for this item
      const { error: deleteClaimsError } = await supabase
        .from('claims')
        .delete()
        .eq('item_id', itemId);

      if (deleteClaimsError) {
        console.error('Error deleting claims:', deleteClaimsError);
        throw deleteClaimsError;
      }

      // Delete the item
      const { error: deleteItemError } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (deleteItemError) {
        console.error('Error deleting item:', deleteItemError);
        throw deleteItemError;
      }

      // Update local state
      setState((s) => ({
        ...s,
        items: s.items.filter((i) => i.id !== itemId),
        claims: s.claims.filter((c) => c.itemId !== itemId),
      }));

      return true;
    } catch (error) {
      console.error('Error marking item as reunited:', error);
      return false;
    }
  };

  const getUserItems = () => state.items.filter((i) => i.userId === user?.id);
  const getUserClaims = () => state.claims.filter((c) => c.claimerId === user?.id);
  const getClaimsForUserItems = () =>
    state.claims.filter((c) => state.items.some((i) => i.id === c.itemId && i.userId === user?.id));
  const getPublicItems = () => state.items.filter((i) => i.userId !== user?.id);

  return (
    <LostFoundContext.Provider
      value={{
        ...state,
        addItem,
        updateItem,
        deleteItem,
        submitClaim,
        respondToClaim,
        removeClaim,
        markItemAsReunited,
        getUserItems,
        getUserClaims,
        getClaimsForUserItems,
        getPublicItems,
        fetchUserItems,
        fetchUserClaims,
        fetchClaimsForUserItems,
      }}
    >
      {children}
    </LostFoundContext.Provider>
  );
};
