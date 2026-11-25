'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { navFor } from '@/lib/nav';
import { homeFor } from '@/lib/roles';
import { AppShell } from '@/components/app-shell';
import { ShellSkeleton } from '@/components/skeleton';
import { ErrorState } from '@/components/error-state';
import type { Shop } from '@/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, logout, authError, retryAuth } = useAuth();
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [unreadChats, setUnreadChats] = useState(0);

  useEffect(() => {
    if (loading || authError) return;
    if (!isAuthenticated) router.push('/auth/login');
    else if (user && (user.role === 'ADMIN' || user.role === 'CUSTOMER')) router.replace(homeFor(user));
  }, [loading, authError, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'OWNER' || user?.role === 'STAFF')) {
      api.shops.mine().then(setShops).catch(() => {});
    }
  }, [isAuthenticated, user?.role]);

  const shopId = shops[0]?.id;
  useEffect(() => {
    if (!shopId) return;
    let alive = true;
    const load = () => api.chat.unread(shopId).then((u) => { if (alive) setUnreadChats(u.messages); }).catch(() => {});
    load();
    const t = setInterval(load, 20000);
    return () => { alive = false; clearInterval(t); };
  }, [shopId]);

  if (loading) return <ShellSkeleton />;
  if (authError && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorState title="Can't open your account" message={authError} onRetry={retryAuth} />
      </div>
    );
  }
  if (!isAuthenticated || !user || user.role === 'ADMIN' || user.role === 'CUSTOMER') return <ShellSkeleton />;

  const isCashier = user.role === 'STAFF';
  const { nav: baseNav, roleLabel } = navFor(user.role);
  const nav = baseNav.map((item) => (item.href === '/dashboard/messages' ? { ...item, badge: unreadChats } : item));

  return (
    <AppShell
      nav={nav}
      title={shops[0]?.name || 'Dashboard'}
      user={user}
      roleLabel={roleLabel}
      onLogout={logout}
      showNotifications={!isCashier}
    >
      {children}
    </AppShell>
  );
}
