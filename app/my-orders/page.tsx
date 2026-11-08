'use client';

import { ListSkeleton, ShellSkeleton } from '@/components/skeleton';
import { ErrorState } from '@/components/error-state';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) router.push('/auth/login');
    else if (user && user.role !== 'CUSTOMER') router.replace(homeFor(user));
  }, [loading, isAuthenticated, user, router]);

  const isCustomer = !loading && isAuthenticated && user?.role === 'CUSTOMER';

  useEffect(() => {
    if (!isCustomer) return;
    let alive = true;
    const load = (first: boolean) =>
      api.orders.mine()
        .then((o) => { if (alive) { setOrders(o); setError(''); } })
        .catch((e) => { if (alive && first) setError(e.message || 'Could not load your orders'); })
        .finally(() => { if (alive && first) setBusy(false); });
    load(true);
    const tick = () => { if (document.visibilityState === 'visible') load(false); };
    const timer = setInterval(tick, 10000);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, [isCustomer]);

  if (loading || !user || user.role !== 'CUSTOMER') {
    return <ShellSkeleton />;
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
          <ListSkeleton rows={3} avatar={false} />
        ) : error ? (
          <ErrorState compact message={error} onRetry={() => window.location.reload()} />
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
