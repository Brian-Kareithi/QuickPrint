'use client';

import { StatCardsSkeleton, ListSkeleton } from '@/components/skeleton';
import { ErrorState } from '@/components/error-state';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Building2, Users, ShoppingBag, DollarSign, CheckCircle2, PauseCircle } from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin.stats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!stats) return (
    <div className="space-y-6">
      <StatCardsSkeleton count={3} />
      <StatCardsSkeleton count={3} />
      <ListSkeleton rows={4} avatar={false} />
    </div>
  );

  const cards = [
    { icon: Building2, label: 'Total shops', value: stats.totalShops },
    { icon: CheckCircle2, label: 'Active shops', value: stats.activeShops },
    { icon: PauseCircle, label: 'Suspended', value: stats.suspendedShops },
    { icon: Users, label: 'Users', value: stats.totalUsers },
    { icon: ShoppingBag, label: 'Orders', value: stats.totalOrders },
    { icon: DollarSign, label: 'Revenue', value: formatCurrency(stats.totalRevenue) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-2xl border p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground/60 uppercase tracking-wider">{c.label}</span>
              <c.icon className="h-4 w-4 text-foreground/30" />
            </div>
            <div className="text-2xl font-semibold tracking-tight mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">People on the platform</h3>
          <span className="text-xs text-foreground/50">{stats.newUsers7d} new in the last 7 days</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { role: 'ADMIN', label: 'Super admins' },
            { role: 'OWNER', label: 'Shop owners' },
            { role: 'STAFF', label: 'Cashiers' },
            { role: 'CUSTOMER', label: 'Customers' },
          ].map((r) => (
            <Link key={r.role} href="/admin/users"
              className="rounded-xl bg-muted/60 hover:bg-muted p-3.5 transition-colors">
              <p className="text-xl font-semibold">{stats.usersByRole?.[r.role] ?? 0}</p>
              <p className="text-xs text-foreground/60">{r.label}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm">
        <div className="px-6 py-4 border-b"><h3 className="text-sm font-semibold">Recent orders</h3></div>
        <div className="p-6 space-y-2">
          {stats.recentOrders?.length ? stats.recentOrders.map((o: any) => (
            <div key={o.id} className="flex justify-between text-sm py-2 border-b border-border/50 last:border-0">
              <span>{o.orderNumber} <span className="text-foreground/50">- {o.shop?.name}</span></span>
              <span className="font-medium">{formatCurrency(o.totalAmount)}</span>
            </div>
          )) : <p className="text-sm text-foreground/50 text-center py-6">No orders yet</p>}
        </div>
      </div>
    </div>
  );
}
