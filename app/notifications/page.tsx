'use client';

import { ListSkeleton } from '@/components/skeleton';
import { ErrorState } from '@/components/error-state';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { RoleShell } from '@/components/role-shell';
import { formatDateTime } from '@/lib/utils';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.notifications.list().then(setNotifications).catch((e) => setError(e.message || 'Could not load notifications')).finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await api.notifications.markRead(id).catch(() => {});
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = async () => {
    await api.notifications.markAllRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <RoleShell title="Notifications">
      <div className="max-w-xl space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground/60">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
          </p>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <ListSkeleton rows={5} avatar={false} />
        ) : error ? (
          <ErrorState compact message={error} onRetry={() => window.location.reload()} />
        ) : notifications.length === 0 ? (
          <div className="bg-card rounded-2xl border text-center py-16">
            <Bell className="h-8 w-8 text-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-foreground/60">No notifications yet. New orders will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={`w-full text-left bg-card rounded-2xl border p-4 flex items-start gap-3 transition-all hover:shadow-sm ${n.read ? 'opacity-60' : ''}`}
              >
                <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-primary'}`} />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium">{n.title}</span>
                  <span className="block text-xs text-foreground/60 mt-0.5">{n.message}</span>
                  <span className="block text-[11px] text-foreground/40 mt-1">{formatDateTime(n.createdAt)}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </RoleShell>
  );
}
