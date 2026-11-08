'use client';

import { ShellSkeleton } from '@/components/skeleton';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { navFor } from '@/lib/nav';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { homeFor } from '@/lib/roles';
import { Loader2, Store, MapPin, ArrowRight } from 'lucide-react';

const LAST_SHOP_KEY = 'qp-linked-shop';

type LinkedShop = { name: string; slug: string; address?: string | null; isAcceptingOrders?: boolean };

export default function SendFilesPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [found, setFound] = useState<LinkedShop | null>(null);
  const [recent, setRecent] = useState<LinkedShop | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) router.push('/auth/login');
    else if (user && user.role !== 'CUSTOMER') router.replace(homeFor(user));
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    try { const raw = localStorage.getItem(LAST_SHOP_KEY); if (raw) setRecent(JSON.parse(raw)); } catch {}
  }, []);

  if (loading || !user || user.role !== 'CUSTOMER') return <ShellSkeleton />;

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFound(null);
    if (code.length !== 5) { setError('The shop code is 5 characters.'); return; }
    setBusy(true);
    try {
      const shop = await api.shops.byCode(code);
      const linked = { name: shop.name, slug: shop.slug, address: shop.address, isAcceptingOrders: shop.isAcceptingOrders };
      try { localStorage.setItem(LAST_SHOP_KEY, JSON.stringify(linked)); } catch {}
      setFound(linked);
    } catch (err: any) {
      setError(err.message || 'Could not find that shop');
    } finally {
      setBusy(false);
    }
  };

  const go = (s: LinkedShop) => router.push(`/shop/${s.slug}`);

  return (
    <AppShell nav={navFor('CUSTOMER').nav} title="Send files" user={user} roleLabel="Customer" onLogout={logout}>
      <div className="max-w-md space-y-4">
        <div>
          <h2 className="text-base font-semibold">Connect to a cyber cafe</h2>
          <p className="text-sm text-foreground/60">Enter the 5-character shop code from the cafe (shown on their counter poster or given by the owner). You can also scan the shop&apos;s QR code with your phone camera.</p>
        </div>

        <form onSubmit={lookup} className="bg-card rounded-2xl border shadow-sm p-5 space-y-3">
          <label htmlFor="shop-code" className="text-xs font-medium text-foreground/60">Shop code</label>
          <input
            id="shop-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
            placeholder="e.g. K7M2P"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            inputMode="text"
            className="block w-full h-14 rounded-xl border border-input bg-card px-3 text-center text-2xl font-semibold tracking-[0.4em] uppercase focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {error && <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={busy || code.length !== 5}>
            {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking...</> : 'Connect'}
          </Button>
        </form>

        {found && (
          <div className="bg-card rounded-2xl border border-primary/30 shadow-sm p-5 space-y-3">
            <div className="flex items-start gap-3">
              <span className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Store className="h-5 w-5 text-primary" /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{found.name}</p>
                {found.address && <p className="text-xs text-foreground/60 flex items-center gap-1"><MapPin className="h-3 w-3 flex-shrink-0" /><span className="truncate">{found.address}</span></p>}
                {found.isAcceptingOrders === false && <p className="text-xs text-orange-700 mt-1">This shop isn&apos;t taking orders right now.</p>}
              </div>
            </div>
            <Button className="w-full" onClick={() => go(found)}>Upload documents <ArrowRight className="h-4 w-4 ml-1.5" /></Button>
          </div>
        )}

        {recent && !found && (
          <button onClick={() => go(recent)} className="w-full text-left bg-card rounded-2xl border p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <span className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0"><Store className="h-4 w-4 text-foreground/60" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] text-foreground/50">Last shop you used</span>
              <span className="block text-sm font-medium truncate">{recent.name}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-foreground/40" />
          </button>
        )}
      </div>
    </AppShell>
  );
}
