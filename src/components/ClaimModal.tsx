
import React, { useState, ReactDOM } from 'react';
import { X, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LostFoundItem } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';


interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, uniqueIdentifiers: string) => void;
  item: LostFoundItem;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item
}) => {
  const { user } = useAuth(); // <- new
  const [reason, setReason] = useState('');
  const [uniqueIdentifiers, setUniqueIdentifiers] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reason.trim() || !uniqueIdentifiers.trim()) return;

    setLoading(true);
    try {
      // 1. insert claim
      await supabase.from('claims').insert({
        item_id: item.id,
        claimer_id: user.id,
        claimer_email: user.email,
        claimer_name: user.user_metadata?.full_name,
        reason,
        unique_identifiers: uniqueIdentifiers,
      });

      // 2. notify reporter
      await supabase.from('notifications').insert({
        user_id: item.userId,
        title: 'New claim on your item',
        body: `${user.user_metadata?.full_name || user.email} claimed “${item.title}”.`,
      });
      
      // Call the onSubmit callback and close modal
      onSubmit(reason, uniqueIdentifiers);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        />
        {/* Modal */}
        <div className="relative w-full max-w-md glass-card animate-scale-in">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {item.type === 'lost' ? 'Report Found Item' : 'Claim This Item'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Item Info */}
            <div className="bg-accent/50 rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            </div>

            {/* Warning */}
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-warning mb-1">Important</p>
                  <p className="text-muted-foreground">
                    Please provide accurate information. False claims may result in account suspension.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Why do you believe this is your item?
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe how you lost this item, when, and why you think this is yours..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifiers">
                  Unique identifiers or proof of ownership
                </Label>
                <Textarea
                  id="identifiers"
                  value={uniqueIdentifiers}
                  onChange={(e) => setUniqueIdentifiers(e.target.value)}
                  placeholder="Describe unique features, serial numbers, scratches, or any other identifying marks..."
                  className="min-h-[80px]"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  disabled={loading || !reason.trim() || !uniqueIdentifiers.trim()}
                  className="flex-1"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Claim
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};
