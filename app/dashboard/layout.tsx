'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Printer, LayoutDashboard, ShoppingBag, ListTodo, BarChart3, Settings, QrCode,
  Palette, DollarSign, Bell, LogOut, Menu, Shield, Building2,
} from 'lucide-react';
import type { Shop } from '@/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/auth/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'ADMIN') {
      api.shops.mine().then(setShops).catch(() => {});
    }
  }, [isAuthenticated]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
  if (!isAuthenticated) return null;

  const isAdmin = user?.role === 'ADMIN';

  const navItems = isAdmin ? [
    { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { href: '/admin?tab=shops', icon: Building2, label: 'Shops' },
    { href: '/admin?tab=retention', icon: Shield, label: 'Retention' },
  ] : [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { href: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
    { href: '/dashboard/queue', icon: ListTodo, label: 'Print Queue' },
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
    { href: '/dashboard/branding', icon: Palette, label: 'Branding' },
    { href: '/dashboard/pricing', icon: DollarSign, label: 'Pricing' },
    { href: '/dashboard/qrcode', icon: QrCode, label: 'QR Code' },
  ];

  const isActive = (href: string) => {
    if (href.includes('?')) {
      const [base, q] = href.split('?');
      return pathname === base && window.location.search === '?' + q;
    }
    return pathname === href;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="flex items-center gap-2.5 h-16 px-6 border-b">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <Printer className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-base tracking-tight">QuickPrint</span>
        </div>
        <nav className="p-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-foreground/60 hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          {!isAdmin && shops.length > 0 && (
            <select
              value={activeShop?.id || ''}
              onChange={(e) => setActiveShop(shops.find((s) => s.id === e.target.value) || null)}
              className="w-full text-sm border border-input rounded-lg px-3 py-2 mb-3 bg-background"
            >
              {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          <div className="flex items-center gap-3 px-3 py-1.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-foreground/50 truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-md hover:bg-muted text-foreground/50 hover:text-foreground transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b flex items-center px-5 gap-4 bg-background">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-md hover:bg-muted">
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-base font-semibold">
            {isAdmin ? 'Admin' : activeShop?.name || 'Dashboard'}
          </h2>
          <div className="flex-1" />
          <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell className="h-4 w-4" />
          </Link>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
