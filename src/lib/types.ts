export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  dateReported: string;
  dateLostFound: string;
  status: 'lost' | 'found' | 'claimed' | 'pending_claim' | 'approved_claim';
  type: 'lost' | 'found';
  images: string[];
  userId: string;
  userEmail: string;
  userName: string;
  contactEmail: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
  claimCount?: number;
  approvedClaimerId?: string;
  approvedClaimerEmail?: string;
  approvedClaimerName?: string;
}

export interface Claim {
  id: string;
  itemId: string;
  claimerId: string;
  claimer: {
    email: string;
    name: string;
  };
  reason: string;
  uniqueIdentifiers: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  respondedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface LostFoundState {
  items: LostFoundItem[];
  claims: Claim[];
  loading: boolean;
  error: string | null;
}

export interface ThemeState {
  theme: 'light' | 'dark';
}

export interface FilterOptions {
  search: string;
  category: string;
  location: string;
  dateFrom: string;
  dateTo: string;
  type: 'all' | 'lost' | 'found';
  status: 'all' | 'lost' | 'found' | 'claimed';
}