'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  LayoutDashboard, ShoppingBag, ListTodo, BarChart3, Settings, QrCode,
  Palette, DollarSign, Users,
} from 'lucide-react';
import type { Shop } from '@/types';
import { homeFor } from '@/lib/roles';
import { AppShell, type NavItem } from '@/components/app-shell';

const OWNER_NAV: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/dashboard/queue', icon: ListTodo, label: 'Print Queue' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/qrcode', icon: QrCode, label: 'QR Code' },
  { href: '/dashboard/team', icon: Users, label: 'Team' },
  { href: '/dashboard/branding', icon: Palette, label: 'Branding' },
  { href: '/dashboard/pricing', icon: DollarSign, label: 'Pricing' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

// Cashiers work the counter: take orders, print, hand over.
const CASHIER_NAV: NavItem[] = [
  { href: '/dashboard/queue', icon: ListTodo, label: 'Print Queue' },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/dashboard/qrcode', icon: QrCode, label: 'QR Code' },
];

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

  return (
    <AppShell
      nav={isCashier ? CASHIER_NAV : OWNER_NAV}
      title={shops[0]?.name || 'Dashboard'}
      user={user}
      roleLabel={isCashier ? 'Cashier' : 'Shop owner'}
      onLogout={logout}
      showNotifications={!isCashier}
    >
      {children}
    </AppShell>
  );
}
