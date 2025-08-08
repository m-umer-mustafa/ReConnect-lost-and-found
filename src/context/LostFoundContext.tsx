import React, { createContext, useContext, useEffect, useState } from 'react';
import { LostFoundItem, Claim, LostFoundState } from '@/lib/types';
import { useAuth } from './AuthContext';

interface LostFoundContextType extends LostFoundState {
  addItem: (item: Omit<LostFoundItem, 'id' | 'userId' | 'userEmail' | 'userName' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<LostFoundItem>) => void;
  deleteItem: (id: string) => void;
  submitClaim: (itemId: string, claim: Omit<Claim, 'id' | 'claimerId' | 'claimer' | 'status' | 'createdAt'>) => void;
  respondToClaim: (claimId: string, status: 'approved' | 'rejected') => void;
  removeClaim: (claimId: string) => void;
  getUserItems: () => LostFoundItem[];
  getUserClaims: () => Claim[];
  getClaimsForUserItems: () => Claim[];
  getPublicItems: () => LostFoundItem[];
}

const LostFoundContext = createContext<LostFoundContextType | undefined>(undefined);

export const useLostFound = () => {
  const context = useContext(LostFoundContext);
  if (context === undefined) {
    throw new Error('useLostFound must be used within a LostFoundProvider');
  }
  return context;
};

export const LostFoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<LostFoundState>({
    items: [],
    claims: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    // Load items and claims from localStorage
    const savedItems = JSON.parse(localStorage.getItem('lostFoundItems') || '[]');
    const savedClaims = JSON.parse(localStorage.getItem('claims') || '[]');
    
    setState(prev => ({
      ...prev,
      items: savedItems,
      claims: savedClaims,
    }));
  }, []);

  const saveToStorage = (items: LostFoundItem[], claims: Claim[]) => {
    localStorage.setItem('lostFoundItems', JSON.stringify(items));
    localStorage.setItem('claims', JSON.stringify(claims));
  };

  const addItem = (itemData: Omit<LostFoundItem, 'id' | 'userId' | 'userEmail' | 'userName' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const newItem: LostFoundItem = {
      ...itemData,
      id: Date.now().toString(),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newItems = [...state.items, newItem];
    setState(prev => ({ ...prev, items: newItems }));
    saveToStorage(newItems, state.claims);
  };

  const updateItem = (id: string, updates: Partial<LostFoundItem>) => {
    if (!user) return;

    const newItems = state.items.map(item =>
      item.id === id && item.userId === user.id
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item
    );

    setState(prev => ({ ...prev, items: newItems }));
    saveToStorage(newItems, state.claims);
  };

  const deleteItem = (id: string) => {
    if (!user) return;

    const newItems = state.items.filter(item => 
      !(item.id === id && item.userId === user.id)
    );

    // Also remove related claims
    const newClaims = state.claims.filter(claim => claim.itemId !== id);

    setState(prev => ({ ...prev, items: newItems, claims: newClaims }));
    saveToStorage(newItems, newClaims);
  };

const submitClaim = (
  itemId: string,
  claimData: Omit<Claim, 'id' | 'claimerId' | 'claimer' | 'status' | 'createdAt'>
) => {
  if (!user) return;

  const newClaim: Claim = {
    ...claimData,
    id: Date.now().toString(),
    claimerId: user.id,
    claimer: { email: user.email, name: user.name },
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const newClaims = [...state.claims, newClaim];
  setState(prev => ({ ...prev, claims: newClaims }));
  saveToStorage(state.items, newClaims); // item status NOT touched
};

const respondToClaim = (claimId: string, status: 'approved' | 'rejected') => {
  if (!user) return;

  // 1. Update the single claim status
  let newClaims = state.claims.map(c =>
    c.id === claimId ? { ...c, status, respondedAt: new Date().toISOString() } : c
  );

  // 2. If approved ⇒ mark item 'claimed' and reject siblings
  if (status === 'approved') {
    const approvedClaim = newClaims.find(c => c.id === claimId);
    if (!approvedClaim) return;

    // 2a. update item
    const newItems = state.items.map(item =>
      item.id === approvedClaim.itemId
        ? { ...item, status: 'claimed' as const, updatedAt: new Date().toISOString() }
        : item
    );

    // 2b. reject every other pending claim on same item
    newClaims = newClaims.map(c =>
      c.itemId === approvedClaim.itemId &&
      c.id !== claimId &&
      c.status === 'pending'
        ? { ...c, status: 'rejected' as const, respondedAt: new Date().toISOString() }
        : c
    );

    setState(prev => ({ ...prev, items: newItems, claims: newClaims }));
    saveToStorage(newItems, newClaims);
  } else {
    // simple reject – no cascade
    setState(prev => ({ ...prev, claims: newClaims }));
    saveToStorage(state.items, newClaims);
  }
};

  const removeClaim = (claimId: string) => {
    if (!user) return;

    const claim = state.claims.find(c => c.id === claimId);
    if (!claim || claim.claimerId !== user.id) return;

    const newClaims = state.claims.filter(c => c.id !== claimId);
    
    // Revert item status if it was claimed
    if (claim.status === 'pending') {
      const item = state.items.find(i => i.id === claim.itemId);
      if (item && item.status === 'claimed') {
        const newItems = state.items.map(i =>
          i.id === claim.itemId
            ? { ...i, status: item.type, updatedAt: new Date().toISOString() }
            : i
        );
        setState(prev => ({ ...prev, items: newItems, claims: newClaims }));
        saveToStorage(newItems, newClaims);
        return;
      }
    }

    setState(prev => ({ ...prev, claims: newClaims }));
    saveToStorage(state.items, newClaims);
  };

  const getUserItems = () => {
    if (!user) return [];
    return state.items.filter(item => item.userId === user.id);
  };

  const getUserClaims = () => {
    if (!user) return [];
    return state.claims.filter(claim => claim.claimerId === user.id);
  };

  const getClaimsForUserItems = () => {
    if (!user) return [];
    const userItemIds = getUserItems().map(item => item.id);
    return state.claims.filter(claim => userItemIds.includes(claim.itemId));
  };

  const getPublicItems = () => {
    if (!user) return state.items;
    // Return items that are not from the current user
    return state.items.filter(item => item.userId !== user.id);
  };

  return (
    <LostFoundContext.Provider value={{
      ...state,
      addItem,
      updateItem,
      deleteItem,
      submitClaim,
      respondToClaim,
      removeClaim,
      getUserItems,
      getUserClaims,
      getClaimsForUserItems,
      getPublicItems,
    }}>
      {children}
    </LostFoundContext.Provider>
  );
};