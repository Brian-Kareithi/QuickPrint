'use client';

import { Fragment, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type Filter = '' | 'active' | 'suspended';

export default function AdminShops() {
  const [shops, setShops] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>('');
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    <button onClick={() => setFilter(f)}
      className={`px-4 py-1.5 text-sm font-medium rounded-xl transition-all ${filter === f ? 'bg-primary text-white shadow-md shadow-primary/25' : 'bg-card border text-foreground/60 hover:bg-muted'}`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex gap-2">{chip('', 'All')}{chip('active', 'Active')}{chip('suspended', 'Suspended')}</div>
      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-lg">{error}</div>}

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {['Shop', 'Owner', 'Orders', 'Status', ''].map((h) => (
                    <th key={h} className="text-left p-4 text-xs font-medium text-foreground/60 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shops.map((shop) => (
                  <Fragment key={shop.id}>
                    <tr className="border-b border-border/50 hover:bg-muted/20 cursor-pointer" onClick={() => setOpen(open === shop.id ? null : shop.id)}>
                      <td className="p-4 font-medium">{shop.name}<span className="block text-xs text-foreground/40 font-normal">/{shop.slug}</span></td>
                      <td className="p-4 text-foreground/70">{shop.owner?.name || 'N/A'}</td>
                      <td className="p-4">{shop._count?.orders || 0}</td>
                      <td className="p-4">{shop.isSuspended ? <Badge variant="destructive">Suspended</Badge> : <Badge variant="success">Active</Badge>}</td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" onClick={() => toggle(shop)}>{shop.isSuspended ? 'Activate' : 'Suspend'}</Button>
                      </td>
                    </tr>
                    {open === shop.id && (
                      <tr className="border-b bg-muted/20">
                        <td colSpan={5} className="p-4">
                          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                            <p><span className="text-foreground/50">Owner:</span> {shop.owner?.name}</p>
                            <p><span className="text-foreground/50">Owner email:</span> {shop.owner?.email}</p>
                            <p><span className="text-foreground/50">Owner phone:</span> {shop.owner?.phone || '—'}</p>
                            <p><span className="text-foreground/50">Owner since:</span> {shop.owner?.createdAt ? formatDate(shop.owner.createdAt) : '—'}</p>
                            <p><span className="text-foreground/50">Shop phone:</span> {shop.phone || '—'}</p>
                            <p><span className="text-foreground/50">Address:</span> {shop.address || '—'}</p>
                            <p><span className="text-foreground/50">Cashiers:</span> {shop._count?.staff ?? 0}</p>
                            <p><span className="text-foreground/50">Created:</span> {formatDate(shop.createdAt)}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {shops.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-foreground/50">No shops found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
