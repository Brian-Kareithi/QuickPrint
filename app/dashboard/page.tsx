'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import { DollarSign, ShoppingBag, FileText, TrendingUp, ClipboardList, Plus, Loader2 } from 'lucide-react';
import type { Shop, DashboardStats } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeShop, setActiveShop] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.shops.mine().then((data) => {
      setShops(data);
      if (data.length > 0) setActiveShop(data[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeShop) api.analytics.dashboard(activeShop).then(setStats).catch(() => {});
  }, [activeShop]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  if (shops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
          <ClipboardList className="h-7 w-7 text-foreground/40" />
        </div>
        <h2 className="text-lg font-semibold">No shops yet</h2>
        <p className="text-sm text-foreground/60">Create your first print shop to get started</p>
        <Button onClick={async () => {
          setCreating(true);
          try {
            const shop = await api.shops.create({ name: 'My Print Shop' });
            setShops([shop]);
            setActiveShop(shop.id);
          } finally { setCreating(false); }
        }} disabled={creating}>
          <Plus className="h-4 w-4 mr-1.5" /> {creating ? 'Creating...' : 'Create shop'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <select
          value={activeShop || ''}
          onChange={(e) => setActiveShop(e.target.value)}
          className="text-sm border border-input rounded-lg px-3 py-2 bg-background"
        >
          {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <Button variant="outline" size="sm" onClick={async () => {
          const name = prompt('Shop name:');
          if (name) {
            const shop = await api.shops.create({ name });
            setShops([...shops, shop]);
            setActiveShop(shop.id);
          }
        }}>
          <Plus className="h-3.5 w-3.5 mr-1" /> New shop
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Today's revenue", value: formatCurrency(stats?.todayRevenue || 0) },
          { icon: ShoppingBag, label: 'Orders today', value: stats?.todayOrders || 0 },
          { icon: FileText, label: 'Pages printed', value: stats?.todayPages || 0 },
          { icon: TrendingUp, label: 'Avg order value', value: formatCurrency(stats?.averageOrderValue || 0) },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-xl border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground/60 uppercase tracking-wider">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-foreground/30" />
            </div>
            <div className="text-2xl font-semibold tracking-tight mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="px-6 py-4 border-b">
            <h3 className="text-sm font-semibold">Recent orders</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {stats?.recentOrders?.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-foreground/50 mt-0.5">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                    <span className="text-sm font-semibold">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <p className="text-sm text-foreground/50 text-center py-6">No orders yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-sm">
          <div className="px-6 py-4 border-b">
            <h3 className="text-sm font-semibold">Active queue</h3>
          </div>
          <div className="p-6 flex flex-col items-center justify-center py-10">
            <p className="text-5xl font-bold text-primary">{stats?.activeOrders || 0}</p>
            <p className="text-sm text-foreground/60 mt-1 mb-5">orders in queue</p>
            <Button variant="outline" onClick={() => router.push('/dashboard/queue')}>
              View queue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
