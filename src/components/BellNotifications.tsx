import React, { useState, useEffect, useMemo } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLostFound } from '@/context/LostFoundContext';
import { formatDistanceToNow } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export const BellNotifications: React.FC = () => {
  const { user } = useAuth();
  const { items, claims } = useLostFound();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /* ---------- derive notifications from state ---------- */
  useEffect(() => {
    if (!user) return;

    const generated: Notification[] = [];

    /* 1. Someone claimed my item */
    items
      .filter(i => i.userId === user.id)
      .forEach(item => {
        const claim = claims.find(c => c.itemId === item.id && c.status === 'pending');
        if (claim) {
          generated.push({
            id: `claim-${item.id}-${claim.id}`,
            title: 'New claim on your item',
            body: `${claim.claimer.name} claimed “${item.title}”.`,
            read: false,
            createdAt: claim.createdAt,
          });
        }
      });

    /* 2. My claim was accepted / rejected */
    claims
      .filter(c => c.claimerId === user.id)
      .forEach(c => {
        const item = items.find(i => i.id === c.itemId);
        if (!item) return;
        if (c.status !== 'pending') {
          generated.push({
            id: `respond-${c.id}`,
            title: c.status === 'approved' ? 'Claim approved' : 'Claim rejected',
            body: `Your claim on “${item.title}” was ${c.status}.`,
            read: false,
            createdAt: c.respondedAt || c.createdAt,
          });
        }
      });

    /* 3. Unclaimed for ≥ 7 days */
    items
      .filter(i => i.userId === user.id && i.status !== 'claimed')
      .forEach(item => {
        const age = Date.now() - new Date(item.createdAt).getTime();
        if (age > 7 * 24 * 60 * 60 * 1000) {
          generated.push({
            id: `week-${item.id}`,
            title: 'Still unclaimed',
            body: `Your item “${item.title}” has not been claimed for a week.`,
            read: false,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      });

    setNotifications(generated.reverse());
  }, [items, claims, user]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  /* ---------- render ---------- */
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 max-h-[70vh] overflow-y-auto p-0"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No new notifications
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 text-sm ${
                  !n.read ? 'bg-primary/5' : 'opacity-70'
                }`}
              >
                <p className="font-medium">{n.title}</p>
                <p className="text-muted-foreground">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};