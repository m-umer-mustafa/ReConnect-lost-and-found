import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
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
          variant="outline"
          size="icon"
          className="relative h-11 w-11 overflow-visible"
        >
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background dark:ring-slate-900">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <Bell className="h-5 w-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(92vw,20rem)] rounded-xl border border-slate-200 bg-white p-0 shadow-soft dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <span className="font-semibold tracking-tight text-slate-900 dark:text-slate-100">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-600 dark:text-slate-400">No notifications</div>
        ) : (
          <div className="neo-scrollbar max-h-[62vh] overflow-y-auto divide-y">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 text-sm transition-colors ${!n.read ? 'bg-slate-100/70 dark:bg-slate-800/70' : 'bg-white dark:bg-slate-900'}`}
              >
                <p className="font-medium text-slate-900 dark:text-slate-100">{n.title}</p>
                <p className="text-slate-600 dark:text-slate-300">{n.body}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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