import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
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
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /* ---------- load + subscribe ---------- */
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setNotifications((data ?? []).map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        read: n.read,
        createdAt: n.created_at,
      })));
    };

    load();

    // realtime subscription
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (!error) {
      // Update local state immediately:
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } else {
      // Optionally handle error here (toast, etc.)
      console.error('Failed to mark notifications as read:', error);
    }
  };


  /* ---------- render ---------- */
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative overflow-visible"  // <-- add this
        >
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background shadow-lg">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <Bell className="h-5 w-5" />
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
            <Button variant="ghost" size="sm" className="text-xs" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
        ) : (
          <div className="divide-y">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 text-sm ${!n.read ? 'bg-primary/5' : 'opacity-70'}`}
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