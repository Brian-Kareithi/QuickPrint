'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Loader2, Building2, Users, ShoppingBag, DollarSign, Shield } from 'lucide-react';

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [retention, setRetention] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'shops' | 'retention'>('overview');

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/dashboard');
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      Promise.all([
        api.admin.stats(), api.admin.shops(), api.admin.health(), api.admin.retention(),
      ]).then(([s, sh, h, r]) => {
        setStats(s); setShops(sh.shops || []); setHealth(h); setRetention(r);
      }).finally(() => setLoading(false));
    }
  }, [isAdmin]);

  if (authLoading || loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!isAdmin) return null;

  const tabClass = (t: string) =>
    `px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${tab === t ? 'bg-primary text-white shadow-sm' : 'text-foreground/60 hover:bg-muted'}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button className={tabClass('overview')} onClick={() => setTab('overview')}>Overview</button>
        <button className={tabClass('shops')} onClick={() => setTab('shops')}>Shops</button>
        <button className={tabClass('retention')} onClick={() => setTab('retention')}>Retention</button>
      </div>

      {tab === 'overview' && stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Building2, label: 'Total shops', value: stats.totalShops },
              { icon: Users, label: 'Total users', value: stats.totalUsers },
              { icon: ShoppingBag, label: 'Total orders', value: stats.totalOrders },
              { icon: DollarSign, label: 'Revenue', value: formatCurrency(stats.totalRevenue) },
            ].map((s, i) => (
              <div key={i} className="bg-card rounded-xl border p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground/60 uppercase tracking-wider">{s.label}</span>
                  <s.icon className="h-4 w-4 text-foreground/30" />
                </div>
                <div className="text-2xl font-semibold tracking-tight mt-1">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl border shadow-sm">
            <div className="px-6 py-4 border-b"><h3 className="text-sm font-semibold">Recent orders</h3></div>
            <div className="p-6">
              <div className="space-y-2">
                {stats.recentOrders?.map((order: any) => (
                  <div key={order.id} className="flex justify-between text-sm py-2 border-b border-border/50 last:border-0">
                    <span>{order.orderNumber} <span className="text-foreground/50">- {order.shop?.name}</span></span>
                    <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'shops' && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-4 text-xs font-medium text-foreground/60 uppercase tracking-wider">Name</th>
                  <th className="text-left p-4 text-xs font-medium text-foreground/60 uppercase tracking-wider">Owner</th>
                  <th className="text-left p-4 text-xs font-medium text-foreground/60 uppercase tracking-wider">Orders</th>
                  <th className="text-left p-4 text-xs font-medium text-foreground/60 uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-xs font-medium text-foreground/60 uppercase tracking-wider" />
                </tr>
              </thead>
              <tbody>
                {shops.map((shop: any) => (
                  <tr key={shop.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium">{shop.name}</td>
                    <td className="p-4 text-foreground/60">{shop.owner?.name || 'N/A'}</td>
                    <td className="p-4">{shop._count?.orders || 0}</td>
                    <td className="p-4">
                      {shop.isSuspended ? <Badge variant="destructive">Suspended</Badge> : <Badge variant="success">Active</Badge>}
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm" onClick={async () => {
                        if (shop.isSuspended) await api.admin.activate(shop.id);
                        else await api.admin.suspend(shop.id);
                        const data = await api.admin.shops();
                        setShops(data.shops || []);
                      }}>
                        {shop.isSuspended ? 'Activate' : 'Suspend'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'retention' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="px-6 py-4 border-b"><h3 className="text-sm font-semibold">Document deletion compliance</h3></div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Total uploads', value: retention?.totalUploads },
                { label: 'Deleted', value: retention?.deletedUploads },
                { label: 'Pending deletion', value: retention?.pendingDeletion },
                { label: 'Compliance rate', value: retention?.complianceRate },
              ].map((s) => (
                <div key={s.label} className="flex justify-between text-sm py-2 border-b border-border/50 last:border-0">
                  <span className="text-foreground/60">{s.label}</span>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-sm">
            <div className="px-6 py-4 border-b"><h3 className="text-sm font-semibold">System health</h3></div>
            <div className="p-6">
              {health && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Status: <strong className="text-green-600">{health.status}</strong></span>
                  </div>
                  <div className="text-sm text-foreground/60 space-y-1.5">
                    <p>Uptime: {Math.round(health.uptime / 60)} minutes</p>
                    <p>Uploads (24h): {health.recentUploads24h}</p>
                    <p>Storage: {formatCurrency(health.totalStorageUsed)}</p>
                    <p>Last checked: {formatDateTime(health.timestamp)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
