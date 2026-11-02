'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { navFor } from '@/lib/nav';
import { homeFor } from '@/lib/roles';
import { AppShell } from '@/components/app-shell';
import type { Shop } from '@/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) router.push('/auth/login');
    // Super admins and customers have their own areas.
    else if (user && (user.role === 'ADMIN' || user.role === 'CUSTOMER')) router.replace(homeFor(user));
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'OWNER' || user?.role === 'STAFF')) {
      api.shops.mine().then(setShops).catch(() => {});
    }
  }, [isAuthenticated, user?.role]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
  if (!isAuthenticated || !user || user.role === 'ADMIN' || user.role === 'CUSTOMER') return null;

  const isCashier = user.role === 'STAFF';
  const { nav, roleLabel } = navFor(user.role);

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
