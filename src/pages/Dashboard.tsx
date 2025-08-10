// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Eye,
  Check,
  X,
  CheckCircle2,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLostFound } from '@/context/LostFoundContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { EditItemModal } from '@/components/EditItemModal';
import { SettingsModal } from '@/components/SettingsModal';
import { formatDistanceToNow } from 'date-fns';
import { Claim, LostFoundItem } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    fetchUserItems,
    fetchUserClaims,
    fetchClaimsForUserItems,
    getUserItems,
    getUserClaims,
    getClaimsForUserItems,
    respondToClaim,
    deleteItem,
    markItemAsReunited,
  } = useLostFound();

  const userItems = getUserItems();
  const userClaims = getUserClaims();
  const claimsOnUserItems = getClaimsForUserItems();

  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<LostFoundItem | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showReunitedDialog, setShowReunitedDialog] = useState(false);
  const [reunitedItemId, setReunitedItemId] = useState<string | null>(null);
  const [reunitedClaimId, setReunitedClaimId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      console.log('Fetching dashboard data for user:', user.id);
      await fetchUserItems();
      await fetchUserClaims();
    };

    fetchData();
  }, [user, fetchUserItems, fetchUserClaims]);

  useEffect(() => {
    if (!user || userItems.length === 0) return;
    
    const fetchClaims = async () => {
      await fetchClaimsForUserItems(userItems);
    };
    
    fetchClaims();
  }, [user, userItems, fetchClaimsForUserItems]);

  const handleRespondToClaim = async (
    claimId: string,
    status: 'approved' | 'rejected'
  ) => {
    try {
      if (status === 'rejected') {
        // Delete claim from Supabase
        const { error } = await supabase.from('claims').delete().eq('id', claimId);
        if (error) throw error;

        toast({
          title: 'Claim Rejected',
          description: 'The claim has been rejected and removed from the system.',
        });

        // Refetch user claims and claims on user items to update dashboard
        await fetchUserClaims();
        await fetchClaimsForUserItems(userItems);
      } else {
        // Approve claim (existing logic)
        await respondToClaim(claimId, status);

        toast({
          title: 'Claim Approved',
          description: 'The claimer has been notified and can now contact you.',
        });

        // Refetch user claims and claims on user items to update dashboard
        await fetchUserClaims();
        await fetchClaimsForUserItems(userItems);
      }
    } catch (error) {
      /*toast({
        title: 'Error',
        description: 'Failed to respond to claim. Please try again.',
        variant: 'destructive',
      });*/
    }
  };


  const handleDeleteItem = async (itemId: string) => {
    await deleteItem(itemId);
    toast({
      title: 'Item Deleted',
      description: 'Your item has been removed from the database.',
    });
  };

  const handleUnclaim = async (itemId: string) => {
    try {
      // Find the claim for this item
      const { data: claims } = await supabase
        .from('claims')
        .select('id')
        .eq('item_id', itemId);

      if (claims && claims.length > 0) {
        // Delete the claim
        await supabase.from('claims').delete().eq('id', claims[0].id);
        
        // Reset item status to original type
        const item = userItems.find(i => i.id === itemId);
        if (item) {
          await supabase
            .from('items')
            .update({ status: item.type, updated_at: new Date().toISOString() })
            .eq('id', itemId);
        }

        toast({
          title: 'Claim Removed',
          description: 'The claim has been removed from this item.',
        });
        
        // Refresh the data
        await fetchUserItems();
        await fetchClaimsForUserItems(userItems);
      }
    } catch (error) {
      /*toast({
        title: 'Error',
        description: 'Failed to remove the claim. Please try again.',
        variant: 'destructive',
      });*/
    }
  };

  const handleMarkItemReunited = async (itemId: string, claimId: string) => {
    setReunitedItemId(itemId);
    setReunitedClaimId(claimId);
    setShowReunitedDialog(true);
  };

  const handleConfirmReunited = async () => {
    if (!reunitedItemId || !reunitedClaimId) return;

    try {
      const success = await markItemAsReunited(reunitedItemId, reunitedClaimId);
      
      if (success) {
        toast({
          title: 'Item Reunited!',
          description: 'The item has been successfully marked as reunited. All claimers have been notified.',
          variant: 'default',
        });
        
        // Refresh the data
        await fetchUserItems();
        await fetchUserClaims();
        await fetchClaimsForUserItems(userItems);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to mark item as reunited. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      /*toast({
        title: 'Error',
        description: 'Failed to mark item as reunited. Please try again.',
        variant: 'destructive',
      });*/
    } finally {
      setShowReunitedDialog(false);
      setReunitedItemId(null);
      setReunitedClaimId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimed':
        return 'bg-success text-success-foreground';
      case 'found':
        return 'bg-warning text-warning-foreground';
      case 'lost':
        return 'bg-destructive text-destructive-foreground';
      case 'approved':
        return 'bg-success text-success-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const ItemCard: React.FC<{ item: LostFoundItem }> = ({ item }) => (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-base mb-1">{item.title}</h3>
          <p className="text-muted-foreground text-xs line-clamp-2 mb-2">
            {item.description}
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge className={`${getStatusColor(item.status)} text-xs px-2 py-0.5`}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0.5">{item.category}</Badge>
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground space-y-0.5">
            <p className="truncate">📍 {item.location}</p>
            <p>
              📅 {item.type === 'lost' ? 'Lost' : 'Found'} on{' '}
              {new Date(item.dateLostFound).toLocaleDateString()}
            </p>
            <p>
              ⏰ Reported{' '}
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {item.images.length > 0 && (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-16 h-16 object-cover rounded-md ml-3 flex-shrink-0"
          />
        )}
      </div>

      <div className="flex space-x-1.5 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-8"
          onClick={() => setEditingItem(item)}
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleDeleteItem(item.id)}
          className="flex-1 text-xs h-8"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );

  const ClaimCard: React.FC<{ claim: Claim; isIncoming?: boolean }> = ({
    claim,
    isIncoming = false,
  }) => {
    const item = userItems.find((i) => i.id === claim.itemId);
    const claimerInfo = claim.claimer
      ? { name: claim.claimer.name, email: claim.claimer.email }
      : null;

    return (
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <h3 className="font-semibold text-sm">
                {isIncoming ? 'Claim on Your Item' : 'Your Claim'}
              </h3>
              <Badge className={`${getStatusColor(claim.status)} text-xs px-2 py-0.5`}>
                {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
              </Badge>
            </div>

            {item && (
              <p className="text-xs text-muted-foreground mb-1.5">Item: {item.title}</p>
            )}

            <div className="space-y-1 text-xs">
              <div>
                <p className="font-medium text-xs">Reason:</p>
                <p className="text-muted-foreground text-xs line-clamp-2">{claim.reason}</p>
              </div>

              <div>
                <p className="font-medium text-xs">Unique Identifiers:</p>
                <p className="text-muted-foreground text-xs line-clamp-2">{claim.uniqueIdentifiers}</p>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <span>👤 {claimerInfo?.name || 'Unknown'}</span>
                <span>
                  ⏰{' '}
                  {formatDistanceToNow(new Date(claim.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            {/* New block to show item info for claims sent */}
            {!isIncoming && item && (
              <div className="mt-3 flex items-start gap-3 border-t pt-3">
                {item.images.length > 0 && (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {isIncoming && claim.status === 'pending' && (
          <div className="flex space-x-1.5 pt-3 border-t">
            <Button
              variant="success"
              size="sm"
              onClick={() => handleRespondToClaim(claim.id, 'approved')}
              className="flex-1 text-xs h-7"
            >
              <Check className="h-3 w-3 mr-1" />
              Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRespondToClaim(claim.id, 'rejected')}
              className="flex-1 text-xs h-7"
            >
              <X className="h-3 w-3 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {claim.status === 'approved' && item && (
          <div className="bg-success/10 border-success/20 rounded-md p-3 mt-3">
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <div>
                <p className="font-medium text-success text-sm mb-1">Claim Approved!</p>
                <p className="text-xs text-muted-foreground">
                  Contact the {isIncoming ? 'claimer' : 'item owner'} to arrange
                  the return:
                </p>
                <p className="text-xs font-medium mt-0.5">
                  📧{' '}
                  <a
                    href={`mailto:${isIncoming ? claimerInfo?.email : item.userEmail}`}
                    className="underline text-primary hover:text-primary/80"
                  >
                    {isIncoming ? claimerInfo?.email : item.userEmail}
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Reunited button for approved claims */}
        {!isIncoming && claim.status === 'approved' && (
          <div className="flex space-x-1.5 pt-3 border-t">
            <Button
              variant="success"
              size="sm"
              onClick={() => handleMarkItemReunited(claim.itemId, claim.id)}
              className="flex-1 text-xs h-7 bg-success/10 hover:bg-success/20 text-success border-success/20"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Item Reunited
            </Button>
          </div>
        )}

        {/* Add unclaim button for claims sent */}
        {!isIncoming && claim.status !== 'approved' && (
          <div className="flex space-x-1.5 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUnclaim(claim.itemId)}
              className="flex-1 text-xs h-7 bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20"
            >
              <X className="h-3 w-3 mr-1" />
              Unclaim
            </Button>
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.user_metadata?.full_name || ''}! Manage your items
            and claims here.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSettings(true)}
          className="flex-shrink-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 text-center">
          <div className="text-2xl font-bold text-primary">{userItems.length}</div>
          <div className="text-sm text-muted-foreground">Your Items</div>
        </div>

        <div className="glass-card p-6 text-center">
          <div className="text-2xl font-bold text-warning">{userClaims.length}</div>
          <div className="text-sm text-muted-foreground">Claims Submitted</div>
        </div>

        <div className="glass-card p-6 text-center">
          <div className="text-2xl font-bold text-destructive">
            {claimsOnUserItems.length}
          </div>
          <div className="text-sm text-muted-foreground">Claims Received</div>
        </div>

        <div className="glass-card p-6 text-center">
          <div className="text-2xl font-bold text-success">
            {userItems.filter((item) => item.status === 'claimed').length}
          </div>
          <div className="text-sm text-muted-foreground">Items Reunited</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-0 h-auto sm:h-10 p-1">
          <TabsTrigger value="items" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5">
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">My Items</span>
            <span className="xs:hidden">Items</span>
            <span className="text-xs">({userItems.length})</span>
          </TabsTrigger>
          <TabsTrigger value="claims-sent" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Claims Sent</span>
            <span className="xs:hidden">Sent</span>
            <span className="text-xs">({userClaims.length})</span>
          </TabsTrigger>
          <TabsTrigger value="claims-received" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5">
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Claims Received</span>
            <span className="xs:hidden">Received</span>
            <span className="text-xs">({claimsOnUserItems.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* My Items */}
        <TabsContent value="items" className="space-y-6">
          {userItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {userItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No items reported yet</h3>
              <p className="text-muted-foreground mb-4">
                Report your first lost or found item to get started.
              </p>
              <Button variant="hero" onClick={() => navigate('/report')}>
                Report an Item
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Claims Sent */}
        <TabsContent value="claims-sent" className="space-y-6">
          {userClaims.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {userClaims.map((claim) => (
                <ClaimCard key={claim.id} claim={claim} isIncoming={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No claims submitted</h3>
              <p className="text-muted-foreground mb-4">
                When you find items that might be yours, your claims will appear here.
              </p>
              <Button variant="outline" onClick={() => navigate('/browse')}>
                Browse Items
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Claims Received */}
        <TabsContent value="claims-received" className="space-y-6">
          {claimsOnUserItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {claimsOnUserItems.map((claim) => (
                <ClaimCard key={claim.id} claim={claim} isIncoming={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No claims received</h3>
              <p className="text-muted-foreground mb-4">
                When others claim your items, those claims will appear here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Item Modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Alert Dialog for Marking Item as Reunited */}
      <AlertDialog open={showReunitedDialog} onOpenChange={setShowReunitedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Item as Reunited</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this item as reunited? This will permanently remove the item and all associated claims from the database, and notify all claimers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowReunitedDialog(false);
              setReunitedItemId(null);
              setReunitedClaimId(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReunited}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
