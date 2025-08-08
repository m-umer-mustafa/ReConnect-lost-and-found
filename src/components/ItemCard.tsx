import React, { useState } from 'react';
import { MapPin, Calendar, User, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClaimModal } from '@/components/ClaimModal';
import { LostFoundItem } from '@/lib/types';
import { useLostFound } from '@/context/LostFoundContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ItemCardProps {
  item: LostFoundItem;
  onClaim?: (itemId: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClaim }) => {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const { getUserClaims, removeClaim } = useLostFound();
  const { user } = useAuth();
  const { toast } = useToast();

  const userClaims = getUserClaims();
  const userClaimForItem = userClaims.find(claim => claim.itemId === item.id);
  const isItemClaimed = item.status === 'claimed';
  const canClaim = user && user.id !== item.userId && !isItemClaimed && !userClaimForItem;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimed':
        return 'bg-success text-success-foreground';
      case 'found':
        return 'bg-warning text-warning-foreground';
      case 'lost':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const handleUnclaim = () => {
    if (userClaimForItem) {
      removeClaim(userClaimForItem.id);
      toast({
        title: "Claim Removed",
        description: "Your claim has been removed from this item.",
      });
    }
  };

  const handleClaimSubmit = (reason: string, uniqueIdentifiers: string) => {
    // This will be handled by the ClaimModal through context
    setShowClaimModal(false);
  };

  return (
    <div className="glass-card overflow-hidden hover:shadow-soft transition-all duration-300 group rounded-lg">
      {/* Image */}
      {item.images.length > 0 && (
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {item.images.length > 1 && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
            >
              +{item.images.length - 1} more
            </Badge>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div>
          <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor(item.status)}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
          <Badge variant="outline">{item.category}</Badge>
          <Badge variant="outline">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Badge>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {item.type === 'lost' ? 'Lost' : 'Found'} on{' '}
              {new Date(item.dateLostFound).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
          </div>
        </div>

      {/* Action Button */}
      <div className="p-6 pt-4">
        {canClaim ? (
          <Button
            variant="hero"
            size="sm"
            className="w-full water-drop"
            onClick={() => setShowClaimModal(true)}
          >
            {item.type === 'lost' ? 'Found this item' : 'Claim this item'}
          </Button>
        ) : userClaimForItem ? (
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleUnclaim}
          >
            <X className="h-4 w-4 mr-2" />
            Unclaim Item
          </Button>
        ) : isItemClaimed ? (
          <Button
            variant="secondary"
            size="sm"
            className="w-full cursor-not-allowed"
            disabled
          >
            Already Claimed
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            className="w-full cursor-not-allowed"
            disabled
          >
            Cannot Claim Own Item
          </Button>
        )}
      </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onSubmit={handleClaimSubmit}
        item={item}
      />
    </div>
  );
};