import React, { useState } from 'react';
import { Edit, Trash2, Eye, Check, X, Mail, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLostFound } from '@/context/LostFoundContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { EditItemModal } from '@/components/EditItemModal';
import { formatDistanceToNow } from 'date-fns';
import { Claim, LostFoundItem } from '@/lib/types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    getUserItems, 
    getUserClaims, 
    getClaimsForUserItems, 
    respondToClaim, 
    deleteItem 
  } = useLostFound();
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<LostFoundItem | null>(null);

  const userItems = getUserItems();
  const userClaims = getUserClaims();
  const claimsOnUserItems = getClaimsForUserItems();

  const handleRespondToClaim = (claimId: string, status: 'approved' | 'rejected') => {
    respondToClaim(claimId, status);
    
    toast({
      title: status === 'approved' ? 'Claim Approved' : 'Claim Rejected',
      description: status === 'approved' 
        ? 'The claimer has been notified and can now contact you.'
        : 'The claim has been rejected.',
    });
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItem(itemId);
    toast({
      title: 'Item Deleted',
      description: 'Your item has been removed from the database.',
    });
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
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {item.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={getStatusColor(item.status)}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
            <Badge variant="outline">{item.category}</Badge>
            <Badge variant="outline">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Badge>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>📍 {item.location}</p>
            <p>📅 {item.type === 'lost' ? 'Lost' : 'Found'} on {new Date(item.dateLostFound).toLocaleDateString()}</p>
            <p>⏰ Reported {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</p>
          </div>
        </div>

        {item.images.length > 0 && (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-20 h-20 object-cover rounded-lg ml-4"
          />
        )}
      </div>

      <div className="flex space-x-2 pt-4 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => setEditingItem(item)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => handleDeleteItem(item.id)}
          className="flex-1"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );

  const ClaimCard: React.FC<{ claim: Claim; isIncoming?: boolean }> = ({ 
    claim, 
    isIncoming = false 
  }) => {
    const item = userItems.find(i => i.id === claim.itemId);
    
    return (
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">
                {isIncoming ? 'Claim on Your Item' : 'Your Claim'}
              </h3>
              <Badge className={getStatusColor(claim.status)}>
                {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
              </Badge>
            </div>

            {item && (
              <p className="text-sm text-muted-foreground mb-3">
                Item: {item.title}
              </p>
            )}

            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium">Reason:</p>
                <p className="text-muted-foreground">{claim.reason}</p>
              </div>
              
              <div>
                <p className="font-medium">Unique Identifiers:</p>
                <p className="text-muted-foreground">{claim.uniqueIdentifiers}</p>
              </div>

              <div className="flex items-center gap-4 text-muted-foreground">
                <span>👤 {claim.claimer.name}</span>
                <span>⏰ {formatDistanceToNow(new Date(claim.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions for incoming claims */}
        {isIncoming && claim.status === 'pending' && (
          <div className="flex space-x-2 pt-4 border-t">
            <Button
              variant="success"
              size="sm"
              onClick={() => handleRespondToClaim(claim.id, 'approved')}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRespondToClaim(claim.id, 'rejected')}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {/* Contact info for approved claims */}
        {claim.status === 'approved' && item && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-success mb-1">Claim Approved!</p>
                <p className="text-sm text-muted-foreground">
                  Contact the {isIncoming ? 'claimer' : 'item owner'} to arrange the return:
                </p>
                <p className="text-sm font-medium mt-1">
                  📧 {isIncoming ? claim.claimer.email : item.userEmail}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Manage your items and claims here.
        </p>
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
          <div className="text-2xl font-bold text-destructive">{claimsOnUserItems.length}</div>
          <div className="text-sm text-muted-foreground">Claims Received</div>
        </div>
        
        <div className="glass-card p-6 text-center">
          <div className="text-2xl font-bold text-success">
            {userItems.filter(item => item.status === 'claimed').length}
          </div>
          <div className="text-sm text-muted-foreground">Items Reunited</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            My Items ({userItems.length})
          </TabsTrigger>
          <TabsTrigger value="claims-sent" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Claims Sent ({userClaims.length})
          </TabsTrigger>
          <TabsTrigger value="claims-received" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Claims Received ({claimsOnUserItems.length})
          </TabsTrigger>
        </TabsList>

        {/* My Items */}
        <TabsContent value="items" className="space-y-6">
          {userItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userItems.map(item => (
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
              <Button variant="hero" onClick={() => window.location.href = '/report'}>
                Report an Item
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Claims Sent */}
        <TabsContent value="claims-sent" className="space-y-6">
          {userClaims.length > 0 ? (
            <div className="space-y-6">
              {userClaims.map(claim => (
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
              <Button variant="outline" onClick={() => window.location.href = '/browse'}>
                Browse Items
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Claims Received */}
        <TabsContent value="claims-received" className="space-y-6">
          {claimsOnUserItems.length > 0 ? (
            <div className="space-y-6">
              {claimsOnUserItems.map(claim => (
                <ClaimCard key={claim.id} claim={claim} isIncoming={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No claims received</h3>
              <p className="text-muted-foreground">
                When people claim your reported items, they will appear here.
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
    </div>
  );
};