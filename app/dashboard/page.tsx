'use client';

import { DashboardSkeleton } from '@/components/skeleton';
import { ErrorState } from '@/components/error-state';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { OnboardingForm } from '@/components/onboarding-form';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import { DollarSign, ShoppingBag, FileText, TrendingUp, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import type { Shop, DashboardStats } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [staffCount, setStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'STAFF') router.replace('/dashboard/queue');
  }, [user, router]);

  useEffect(() => {
    api.shops.mine().then((data) => {
      setShops(data);
      if (data.length > 0) setShop(data[0]);
    }).catch((e) => setError(e.message || 'Could not load your dashboard')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!shop) return;
    api.analytics.dashboard(shop.id).then(setStats).catch(() => {});
    api.shops.byId(shop.id).then((s) => setShop((prev) => (prev && prev.id === s.id ? { ...prev, ...s } : prev))).catch(() => {});
    api.shops.staff(shop.id).then((s) => setStaffCount(s.length)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop?.id]);

  if (loading) return <DashboardSkeleton />;
  if (error && !shop) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  if (!shop) {
    return <OnboardingForm onCreated={(s) => { setShops([s]); setShop(s); }} />;
  }

  const paymentsDone = !!(shop.mpesaNumber || shop.airtelNumber || shop.bankAccountNumber);
  const hasOrders = (stats?.totalOrders || 0) > 0;
  const steps = [
    { done: true, label: 'Create your business', href: '/dashboard/settings' },
    { done: paymentsDone, label: 'Add your payment details', href: '/dashboard/payments' },
    { done: false, label: 'Print or share your QR code', href: '/dashboard/qrcode' },
    { done: staffCount > 0, label: 'Invite a cashier (optional)', href: '/dashboard/team' },
    { done: hasOrders, label: 'Receive your first order', href: '/dashboard/queue' },
  ];
  const remaining = steps.filter((s) => !s.done).length;
  const accepting = shop.isAcceptingOrders !== false;

  const toggleAccepting = async () => {
    setToggling(true);
    try {
      const updated = await api.shops.update(shop.id, { isAcceptingOrders: !accepting });
      setShop({ ...shop, isAcceptingOrders: updated.isAcceptingOrders });
    } catch (e: any) {
      alert(e.message || 'Could not update your shop');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-5">
      {shops.length > 1 && (
        <select value={shop.id} onChange={(e) => setShop(shops.find((s) => s.id === e.target.value) || shop)}
          className="text-sm border border-input rounded-xl px-3 py-2.5 bg-card">
          {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      )}

      <div className={`rounded-2xl border p-4 flex items-center justify-between gap-3 transition-colors ${accepting ? 'bg-primary/10 border-primary/30' : 'bg-amber-50 border-amber-200'}`}>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{accepting ? 'Your shop is open for orders' : 'Orders are paused'}</p>
          <p className="text-xs text-foreground/60">
            {accepting ? 'Customers can upload files and place orders.' : 'Customers can see your page but cannot place new orders.'}
          </p>
        </div>
        <button
          role="switch"
          aria-checked={accepting}
          disabled={toggling}
          onClick={toggleAccepting}
          className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors disabled:opacity-60 ${accepting ? 'bg-primary' : 'bg-foreground/25'}`}
          title={accepting ? 'Pause new orders' : 'Accept orders again'}
        >
          <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${accepting ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      {remaining > 0 && (
        <div className="bg-card rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Get started</h3>
            <Link href={`/shop/${shop.slug}`} target="_blank" className="text-xs text-primary font-medium inline-flex items-center gap-1 hover:underline">
              View your customer page <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {steps.map((s) => (
              <Link key={s.label} href={s.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-[13px] transition-all hover:-translate-y-0.5 hover:shadow-sm ${s.done ? 'bg-primary/10 border-primary/30' : 'bg-background'}`}>
                {s.done ? <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" /> : <Circle className="h-4 w-4 text-foreground/30 flex-shrink-0" />}
                <span className={s.done ? 'text-foreground/60 line-through' : 'font-medium'}>{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: DollarSign, label: "Today's revenue", value: formatCurrency(stats?.todayRevenue || 0) },
          { icon: ShoppingBag, label: 'Orders today', value: stats?.todayOrders || 0 },
          { icon: FileText, label: 'Pages today', value: stats?.todayPages || 0 },
          { icon: TrendingUp, label: 'Avg order value', value: formatCurrency(stats?.averageOrderValue || 0) },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-2xl border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-foreground/60 uppercase tracking-wider">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-primary/60" />
            </div>
            <div className="text-xl font-semibold tracking-tight mt-1.5">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-2xl border shadow-sm">
          <div className="px-5 py-3.5 border-b"><h3 className="text-sm font-semibold">Recent orders</h3></div>
          <div className="p-5 space-y-1">
            {stats?.recentOrders?.slice(0, 6).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
                <div>
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-foreground/50">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${getStatusColor(order.status)}`}>{order.status.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-semibold">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            ))}
            {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
              <p className="text-sm text-foreground/50 text-center py-8">No orders yet. Share your QR code to get started.</p>
            )}
          </div>
        </div>

        <div className="bg-panel text-white rounded-2xl shadow-lg shadow-[#003249]/20 p-5 flex flex-col items-center justify-center text-center">
          <p className="text-5xl font-bold text-[#80ced7]">{stats?.activeOrders || 0}</p>
          <p className="text-sm text-white/70 mt-1 mb-4">orders in the queue</p>
          <Button variant="secondary" className="bg-white text-[#003249] hover:bg-white/90" onClick={() => router.push('/dashboard/queue')}>View queue</Button>
        </div>
      </div>
    </div>
  );
}
