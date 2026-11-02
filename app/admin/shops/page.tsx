'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Loader2, Search, ChevronDown, UserRoundCog, Check } from 'lucide-react';

type Filter = '' | 'active' | 'suspended';

/** Pick a shop owner account to hand a business over to. */
function OwnerPicker({ shop, onDone, onCancel }: { shop: any; onDone: (updated: any) => void; onCancel: () => void }) {
  const [q, setQ] = useState('');
  const [owners, setOwners] = useState<any[] | null>(null);
  const [picked, setPicked] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      api.admin.users({ role: 'OWNER', q, limit: 20 })
        .then((d) => setOwners(d.users.filter((u: any) => u.id !== shop.ownerId && !u.isSuspended)))
        .catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(t);
  }, [q, shop.ownerId]);

  const confirmChange = async () => {
    if (!picked) return;
    if (!confirm(`Transfer "${shop.name}" from ${shop.owner?.name} to ${picked.name}?\n\n${shop.owner?.name} will lose access to this shop and its orders. This is recorded in the activity log.`)) return;
    setSaving(true);
    setError('');
    try {
      onDone(await api.admin.changeShopOwner(shop.id, picked.id));
    } catch (e: any) {
      setError(e.message || 'Could not change the owner');
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border bg-card p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold">Change owner of {shop.name}</p>
        <p className="text-xs text-foreground/60">Current owner: {shop.owner?.name} ({shop.owner?.email}). Only accounts with the Shop owner role can be chosen. Change someone&apos;s role in All users first if needed.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search owners by name, email or phone"
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm" />
      </div>

      <div className="max-h-56 overflow-y-auto rounded-xl border divide-y">
        {!owners ? (
          <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
        ) : owners.length === 0 ? (
          <p className="text-xs text-foreground/50 text-center py-6">No other shop owners found</p>
        ) : owners.map((o) => (
          <button key={o.id} type="button" onClick={() => setPicked(o)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${picked?.id === o.id ? 'bg-primary/10' : 'hover:bg-muted/50'}`}>
            <span className="h-8 w-8 rounded-full bg-[#9ad1d4]/50 text-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">{o.name.charAt(0).toUpperCase()}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium truncate">{o.name}</span>
              <span className="block text-xs text-foreground/60 truncate">{o.email}{o.ownedShops?.length ? ` · owns ${o.ownedShops.length} shop${o.ownedShops.length > 1 ? 's' : ''}` : ''}</span>
            </span>
            {picked?.id === o.id && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-2.5 rounded-lg">{error}</div>}

      <div className="flex gap-2">
        <Button size="sm" onClick={confirmChange} disabled={!picked || saving}>
          {saving ? 'Transferring...' : picked ? `Transfer to ${picked.name}` : 'Select a new owner'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
      </div>
    </div>
  );
}

export default function AdminShops() {
  const [shops, setShops] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>('');
  const [open, setOpen] = useState<string | null>(null);
  const [changing, setChanging] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async (f: Filter) => {
    try {
      const data = await api.admin.shops(1, 100, f || undefined);
      setShops(data.shops || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const toggle = async (shop: any) => {
    setError('');
    try {
      if (shop.isSuspended) await api.admin.activate(shop.id); else await api.admin.suspend(shop.id);
      await load(filter);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const chip = (f: Filter, label: string) => (
    <button key={label} onClick={() => setFilter(f)}
      className={`px-4 py-1.5 text-[13px] font-medium rounded-full transition-all ${filter === f ? 'bg-ink text-white shadow-md shadow-[#003249]/20' : 'bg-card border text-foreground/60 hover:bg-muted'}`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">{chip('', 'All')}{chip('active', 'Active')}{chip('suspended', 'Suspended')}</div>
      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-xl">{error}</div>}
      {notice && <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm p-3 rounded-xl">{notice}</div>}

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : shops.length === 0 ? (
          <p className="p-12 text-center text-sm text-foreground/50">No shops found</p>
        ) : shops.map((shop) => (
          <div key={shop.id} className="border-b last:border-0">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-muted/20 transition-colors">
              <button className="flex items-center gap-3 flex-1 min-w-0 text-left" onClick={() => setOpen(open === shop.id ? null : shop.id)}>
                <ChevronDown className={`h-4 w-4 text-foreground/40 flex-shrink-0 transition-transform ${open === shop.id ? 'rotate-180' : ''}`} />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold truncate">{shop.name}</span>
                    {shop.isSuspended ? <Badge variant="destructive">Suspended</Badge> : <Badge variant="success">Active</Badge>}
                  </span>
                  <span className="block text-xs text-foreground/60 truncate">
                    Owner: {shop.owner?.name || 'N/A'} · {shop._count?.orders || 0} orders · {shop._count?.staff ?? 0} cashiers
                  </span>
                </span>
              </button>
              <div className="flex gap-2 sm:flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => { setOpen(shop.id); setChanging(shop.id); setNotice(''); }}>
                  <UserRoundCog className="h-3.5 w-3.5 mr-1.5" /> Change owner
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggle(shop)}>{shop.isSuspended ? 'Activate' : 'Suspend'}</Button>
              </div>
            </div>

            {open === shop.id && (
              <div className="px-4 pb-4 sm:pl-11 bg-muted/20">
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm pt-3">
                  <p><span className="text-foreground/50">Owner:</span> {shop.owner?.name}</p>
                  <p className="break-all"><span className="text-foreground/50">Owner email:</span> {shop.owner?.email}</p>
                  <p><span className="text-foreground/50">Owner phone:</span> {shop.owner?.phone || '—'}</p>
                  <p><span className="text-foreground/50">Owner since:</span> {shop.owner?.createdAt ? formatDate(shop.owner.createdAt) : '—'}</p>
                  <p><span className="text-foreground/50">Shop phone:</span> {shop.phone || '—'}</p>
                  <p><span className="text-foreground/50">Address:</span> {shop.address || '—'}</p>
                  <p><span className="text-foreground/50">Link:</span> /shop/{shop.slug}</p>
                  <p><span className="text-foreground/50">Created:</span> {formatDate(shop.createdAt)}</p>
                </div>
                {changing === shop.id && (
                  <OwnerPicker
                    shop={shop}
                    onCancel={() => setChanging(null)}
                    onDone={(updated) => {
                      setShops((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
                      setChanging(null);
                      setNotice(`"${updated.name}" is now owned by ${updated.owner?.name}.`);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
