import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LostFoundItem } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';

interface ItemCardProps {
  item: LostFoundItem;
  onClaim?: (itemId: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClaim }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!item) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimed':
        return 'bg-pending/20 text-pending-foreground border-pending/40';
      case 'found':
        return 'bg-found/20 text-found-foreground border-found/40';
      case 'lost':
        return 'bg-lost/20 text-lost-foreground border-lost/40';
      case 'approved':
        return 'bg-primary/20 text-primary border-primary/40';
      case 'rejected':
        return 'bg-destructive/15 text-destructive border-destructive/35';
      case 'pending':
        return 'bg-pending/20 text-pending-foreground border-pending/40';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
    }
  };

  /* ---------- helpers ---------- */
  const getUserClaims = async () => {
    if (!user) return [];
    const { data } = await supabase
      .from('claims')
      .select('*')
      .eq('claimer_id', user.id);
    return data ?? [];
  };

  const removeClaim = async (claimId: string) => {
    await supabase.from('claims').delete().eq('id', claimId);
    toast({ title: 'Claim Removed', description: 'Your claim has been removed from this item.' });
  };

  const handleUnclaim = async () => {
    const { data: claims } = await supabase
      .from('claims')
      .select('id')
      .eq('item_id', item.id)
      .eq('claimer_id', user!.id);
    const claim = claims?.[0];
    if (claim) {
      await removeClaim(claim.id);
      // Reset item status to original type (lost/found)
      await supabase
        .from('items')
        .update({ status: item.type, updated_at: new Date().toISOString() })
        .eq('id', item.id);
      window.location.reload();
    }
  };

  // handleClaimSubmit is now handled by the parent component

  /* ---------- local state ---------- */
  const [userClaims, setUserClaims] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    (async () => setUserClaims(await getUserClaims()))();
  }, [user]);

  const userClaimForItem = userClaims.find(c => c.item_id === item.id);
  const isItemClaimed = item.status === 'claimed';
  const canClaim = user && user.id !== item.userId && !isItemClaimed && !userClaimForItem;

  const categoryLabel = (item.category || 'general').toUpperCase();
  const statusLabel = item.status.charAt(0).toUpperCase() + item.status.slice(1);
  const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-card transition-all duration-200 hover:scale-[1.01] hover:shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <span className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
        {categoryLabel}
      </span>

      {item.images.length > 0 && (
        <div className="relative aspect-video overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
          <img
            src={item.images[0]}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
          {item.images.length > 1 && (
            <Badge className="absolute right-3 top-3 rounded-full border border-slate-300 bg-white/95 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200">
              +{item.images.length - 1} more
            </Badge>
          )}
        </div>
      )}

      <div className="space-y-4 p-4 pt-10 text-left sm:space-y-5 sm:p-5 sm:pt-11 md:p-6 md:pt-11">
        <div>
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-tight tracking-tight text-slate-900 sm:text-xl dark:text-slate-100">
            {item.title}
          </h3>
          <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {item.description || 'No additional description provided.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(item.status)}`}>
            {statusLabel}
          </Badge>
          <Badge className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {typeLabel}
          </Badge>
        </div>

        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.location || 'Unknown location'}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {item.type === 'lost' ? 'Lost' : 'Found'} on{' '}
              {item.dateLostFound && !isNaN(new Date(item.dateLostFound).getTime())
                ? new Date(item.dateLostFound).toLocaleDateString()
                : 'Unknown date'}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
            <User className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {item.createdAt && !isNaN(new Date(item.createdAt).getTime())
                ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                : 'Unknown time'}
            </span>
          </div>
        </div>

        <div>
        {canClaim ? (
          <Button
            variant="default"
            className="w-full"
            onClick={() => onClaim?.(item.id)}
          >
            {item.type === 'lost' ? 'Found this item' : 'Claim this item'}
          </Button>
        ) : userClaimForItem ? (
          <Button
            variant="warning"
            className="w-full"
            onClick={handleUnclaim}
          >
            <X className="h-4 w-4 mr-2" />
            Unclaim Item
          </Button>
        ) : isItemClaimed ? (
          <Button
            variant="outline"
            className="w-full cursor-not-allowed"
            disabled
          >
            Already Claimed
          </Button>
        ) : (
          <Button
            variant="destructive"
            className="w-full cursor-not-allowed"
            disabled
          >
            Cannot Claim Own Item
          </Button>
        )}
        </div>
      </div>
    </article>
  );
};