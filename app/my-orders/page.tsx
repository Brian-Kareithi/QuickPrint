'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { navFor } from '@/lib/nav';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { AppShell } from '@/components/app-shell';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import { homeFor } from '@/lib/roles';

export default function MyOrdersPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) router.push('/auth/login');
    else if (user && user.role !== 'CUSTOMER') router.replace(homeFor(user));
    else api.orders.mine().then(setOrders).catch(() => {}).finally(() => setBusy(false));
  }, [loading, isAuthenticated, user, router]);

  if (loading || !user || user.role !== 'CUSTOMER') {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <AppShell
      nav={navFor('CUSTOMER').nav}
      title="My orders"
      user={user}
      roleLabel="Customer"
      onLogout={logout}
    >
      <div className="max-w-2xl space-y-4">
        <p className="text-sm text-foreground/60">To print something, scan the QR code at the shop. Your orders will show up here when you&apos;re signed in.</p>
        {busy ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : orders.length === 0 ? (
          <div className="bg-card rounded-2xl border p-12 text-center text-sm text-foreground/50">No orders yet</div>
        ) : orders.map((o) => (
          <div key={o.id} className="bg-card rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{o.orderNumber}</p>
                <p className="text-xs text-foreground/50">{o.shop?.name} · {formatDateTime(o.createdAt)}</p>
              </div>
              <Badge className={getStatusColor(o.status)}>{o.status.replace(/_/g, ' ')}</Badge>
            </div>
            <ul className="mt-3 text-xs text-foreground/60 space-y-1">
              {o.items?.map((i: any) => <li key={i.id} className="truncate">{i.fileName} · {i.copies}x · {i.pageCount}pgs</li>)}
            </ul>
            <p className="mt-3 text-sm font-semibold text-right">{formatCurrency(o.totalAmount)}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
