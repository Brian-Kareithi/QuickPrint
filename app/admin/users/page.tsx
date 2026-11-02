'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Loader2, Search, ChevronLeft, ChevronRight, Store, ShoppingBag } from 'lucide-react';

const ROLES = [
  { value: '', label: 'All' },
  { value: 'ADMIN', label: 'Admins' },
  { value: 'OWNER', label: 'Shop owners' },
  { value: 'STAFF', label: 'Cashiers' },
  { value: 'CUSTOMER', label: 'Customers' },
];
const ROLE_LABEL: Record<string, string> = { ADMIN: 'Super admin', OWNER: 'Shop owner', STAFF: 'Cashier', CUSTOMER: 'Customer' };
const ROLE_STYLE: Record<string, string> = {
  ADMIN: 'bg-[#003249] text-white',
  OWNER: 'bg-primary/15 text-primary',
  STAFF: 'bg-[#9ad1d4]/50 text-[#003249]',
  CUSTOMER: 'bg-stone-200 text-stone-700',
};

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ users: any[]; total: number; totalPages: number } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => { setQ(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    try {
      setError('');
      setData(await api.admin.users({ q, role, page, limit: 20 }));
    } catch (e: any) {
      setError(e.message);
    }
  }, [q, role, page]);

  useEffect(() => { load(); }, [load]);

  const change = async (u: any, patch: { role?: string; isSuspended?: boolean }, confirmText: string) => {
    if (!confirm(confirmText)) return;
    setBusy(u.id);
    try {
      await api.admin.updateUser(u.id, patch);
      await load();
    } catch (e: any) {
      alert(e.message || 'Could not update the user');
    } finally {
      setBusy(null);
    }
  };

  const chip = (value: string, label: string) => (
    <button key={value} onClick={() => { setRole(value); setPage(1); }}
      className={`px-3.5 py-1.5 text-[13px] font-medium rounded-full whitespace-nowrap transition-all ${role === value ? 'bg-[#003249] text-white shadow-md shadow-[#003249]/20' : 'bg-card border text-foreground/60 hover:bg-muted'}`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or phone"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-card text-sm" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">{ROLES.map((r) => chip(r.value, r.label))}</div>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-xl">{error}</div>}

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        {!data ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : data.users.length === 0 ? (
          <p className="text-center text-sm text-foreground/50 py-12">No users match your search</p>
        ) : data.users.map((u) => {
          const isMe = u.id === me?.id;
          const locked = isMe || u.isPlatformOwner;
          return (
            <div key={u.id} className="p-4 border-b last:border-0 hover:bg-muted/25 transition-colors flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-9 w-9 rounded-full bg-[#9ad1d4]/50 text-[#003249] flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-semibold truncate">{u.name}</p>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${ROLE_STYLE[u.role]}`}>{ROLE_LABEL[u.role]}</span>
                    {u.isSuspended && <Badge variant="destructive">Suspended</Badge>}
                    {isMe && <span className="text-[11px] text-foreground/50">(you)</span>}
                  </div>
                  <p className="text-xs text-foreground/60 truncate">{u.email}{u.phone ? ` · ${u.phone}` : ''}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-foreground/50">
                    {u.ownedShops?.length > 0 && (
                      <span className="inline-flex items-center gap-1"><Store className="h-3 w-3" /> Owns {u.ownedShops.map((s: any) => s.name).join(', ')}</span>
                    )}
                    {u.staffAt?.length > 0 && (
                      <span className="inline-flex items-center gap-1"><Store className="h-3 w-3" /> Cashier at {u.staffAt.map((s: any) => s.shop.name).join(', ')}</span>
                    )}
                    {u._count?.orders > 0 && <span className="inline-flex items-center gap-1"><ShoppingBag className="h-3 w-3" /> {u._count.orders} orders</span>}
                    <span>Joined {formatDate(u.createdAt)}</span>
                    <span>{u.lastLoginAt ? `Last seen ${formatDateTime(u.lastLoginAt)}` : 'Never signed in'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:flex-shrink-0">
                <select
                  disabled={locked || busy === u.id}
                  value={u.role}
                  onChange={(e) => change(u, { role: e.target.value }, `Change ${u.name}'s role to ${ROLE_LABEL[e.target.value]}?`)}
                  className="h-9 rounded-lg border border-input bg-background px-2 text-xs disabled:opacity-50"
                  title={u.isPlatformOwner ? 'Platform owner account' : isMe ? 'You cannot change your own role' : 'Change role'}
                >
                  {Object.entries(ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <Button
                  size="sm"
                  variant={u.isSuspended ? 'default' : 'outline'}
                  disabled={locked || busy === u.id}
                  onClick={() => change(u, { isSuspended: !u.isSuspended },
                    u.isSuspended ? `Reactivate ${u.name}?` : `Suspend ${u.name}? They will be signed out and unable to log in.`)}
                >
                  {u.isSuspended ? 'Reactivate' : 'Suspend'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/60">{data.total} users</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-xs text-foreground/60">Page {page} of {data.totalPages}</span>
            <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
      {data && data.totalPages <= 1 && <p className="text-xs text-foreground/50">{data.total} user{data.total === 1 ? '' : 's'}</p>}
    </div>
  );
}
