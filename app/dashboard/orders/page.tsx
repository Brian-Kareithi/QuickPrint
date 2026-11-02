'use client';

import { Fragment, useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PrintFileButton } from '@/components/print-file-button';
import { MarkPaidButton } from '@/components/mark-paid-button';
import { downloadCsv } from '@/lib/csv';
import { formatCurrency, formatDateTime, getStatusColor, getPaymentStatusColor } from '@/lib/utils';
import { Loader2, Search, Download } from 'lucide-react';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'New' },
  { value: 'PRINTING', label: 'Printing' },
  { value: 'READY_FOR_PICKUP', label: 'Ready' },
  { value: 'COLLECTED', label: 'Collected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];
const RANGES = [
  { value: 'all', label: 'All time', days: 0 },
  { value: 'today', label: 'Today', days: 1 },
  { value: '7', label: 'Last 7 days', days: 7 },
  { value: '30', label: 'Last 30 days', days: 30 },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState('');
  const [payment, setPayment] = useState<'' | 'paid' | 'unpaid'>('');
  const [range, setRange] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.shops.mine().then((shops) => {
      if (shops.length > 0) return api.orders.list(shops[0].id).then(setOrders);
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const days = RANGES.find((r) => r.value === range)?.days || 0;
    let since = 0;
    if (days === 1) { const d = new Date(); d.setHours(0, 0, 0, 0); since = d.getTime(); }
    else if (days > 1) since = Date.now() - days * 86400000;

    return orders.filter((o) => {
      if (status && o.status !== status) return false;
      if (payment === 'paid' && !o.isPaid) return false;
      if (payment === 'unpaid' && o.isPaid) return false;
      if (since && new Date(o.createdAt).getTime() < since) return false;
      if (!q) return true;
      return o.orderNumber.toLowerCase().includes(q)
        || (o.customerName || '').toLowerCase().includes(q)
        || (o.customerPhone || '').includes(q);
    });
  }, [orders, filter, status, payment, range]);

  const total = filtered.reduce((sum, o) => sum + (o.status === 'CANCELLED' ? 0 : o.totalAmount), 0);
  const collected = filtered.filter((o) => o.isPaid).reduce((sum, o) => sum + o.totalAmount, 0);

  const updatePaid = (u: any) => setOrders((prev) => prev.map((o) => (o.id === u.id ? { ...o, ...u } : o)));

  const exportCsv = () => {
    downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Order', 'Date', 'Customer', 'Phone', 'Status', 'Payment', 'Method', 'Files', 'Pages', 'Total'],
      ...filtered.map((o) => [
        o.orderNumber, new Date(o.createdAt).toLocaleString(), o.customerName || 'Walk-in', o.customerPhone || '',
        o.status, o.isPaid ? 'PAID' : 'UNPAID', o.paymentMethod || '', o.items?.length || 0,
        (o.items || []).reduce((s: number, i: any) => s + i.pageCount * i.copies, 0), o.totalAmount,
      ]),
    ]);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const chip = (active: boolean, label: string, onClick: () => void) => (
    <button key={label} onClick={onClick}
      className={`px-3.5 py-1.5 text-[13px] font-medium rounded-full whitespace-nowrap transition-all ${active ? 'bg-[#003249] text-white shadow-md shadow-[#003249]/20' : 'bg-card border text-foreground/60 hover:bg-muted'}`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Orders</h2>
          <p className="text-xs text-foreground/60">
            {filtered.length} order{filtered.length === 1 ? '' : 's'} · {formatCurrency(total)} total · {formatCurrency(collected)} collected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <input value={filter} onChange={(e) => setFilter(e.target.value)}
              className="pl-9 h-10 w-full rounded-xl border border-input bg-card px-3 text-sm" placeholder="Order, name or phone" />
          </div>
          <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0} title="Download as CSV">
            <Download className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
          {STATUS_FILTERS.map((s) => chip(status === s.value, s.label, () => setStatus(s.value)))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {([['', 'Any payment'], ['paid', 'Paid'], ['unpaid', 'Unpaid']] as const).map(([v, l]) => chip(payment === v, l, () => setPayment(v)))}
          <select value={range} onChange={(e) => setRange(e.target.value)} className="h-8 rounded-full border border-input bg-card px-3 text-[13px]">
            {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-xl">{error}</div>}

      <div className="md:hidden space-y-3">
        {filtered.map((order) => (
          <div key={order.id} className="bg-card rounded-2xl border shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm">{order.orderNumber}</p>
                <p className="text-xs text-foreground/60 truncate">{order.customerName || 'Walk-in'} · {formatDateTime(order.createdAt)}</p>
              </div>
              <span className="font-semibold text-sm">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(order.status)}>{order.status.replace(/_/g, ' ')}</Badge>
              <Badge className={getPaymentStatusColor(order.paymentStatus)}>{order.paymentStatus}</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>{expanded === order.id ? 'Hide files' : 'Files'}</Button>
            {expanded === order.id && (
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <MarkPaidButton order={order} onChange={updatePaid} />
                  {order.customerPhone && <a href={`tel:${order.customerPhone}`} className="text-primary font-medium">{order.customerPhone}</a>}
                </div>
                {order.items?.map((item: any) => (
                  <div key={item.id} className="rounded-xl bg-muted/60 p-3 text-xs space-y-2">
                    <p className="font-medium truncate">{item.fileName}</p>
                    <p className="text-foreground/60">{item.copies}x · {item.colorMode === 'FULL_COLOR' ? 'Color' : 'B&W'} · {item.paperSize} · {item.pageCount}pgs</p>
                    <PrintFileButton item={item} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="bg-card rounded-2xl border p-10 text-center text-sm text-foreground/50">No orders found</p>}
      </div>

      <div className="hidden md:block bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {['Order #', 'Customer', 'Status', 'Payment', 'Amount', 'Date', ''].map((h) => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-foreground/60 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <Fragment key={order.id}>
                  <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium text-sm">{order.orderNumber}</td>
                    <td className="p-4 text-sm">{order.customerName || 'Walk-in'}</td>
                    <td className="p-4"><Badge className={getStatusColor(order.status)}>{order.status.replace(/_/g, ' ')}</Badge></td>
                    <td className="p-4"><Badge className={getPaymentStatusColor(order.paymentStatus)}>{order.paymentStatus}</Badge></td>
                    <td className="p-4 font-semibold text-sm">{formatCurrency(order.totalAmount)}</td>
                    <td className="p-4 text-sm text-foreground/60">{formatDateTime(order.createdAt)}</td>
                    <td className="p-4"><Button variant="outline" size="sm" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>{expanded === order.id ? 'Hide' : 'Files'}</Button></td>
                  </tr>
                  {expanded === order.id && (
                    <tr className="border-b border-border/50 bg-muted/20">
                      <td colSpan={7} className="p-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs pb-1">
                          <span className="text-foreground/60">Payment:</span>
                          <MarkPaidButton order={order} onChange={updatePaid} />
                          {order.customerPhone && (
                            <span className="text-foreground/60">· {order.customerName || 'Customer'}: <a href={`tel:${order.customerPhone}`} className="text-primary font-medium">{order.customerPhone}</a></span>
                          )}
                        </div>
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 text-xs text-foreground/70">
                            <span className="truncate font-medium">{item.fileName}</span>
                            <span>&middot; {item.copies}x</span>
                            <span>&middot; {item.colorMode === 'FULL_COLOR' ? 'Color' : 'B&W'}</span>
                            <span>&middot; {item.paperSize}</span>
                            <span>&middot; {item.pageCount}pgs</span>
                            <span className="flex-1" />
                            <PrintFileButton item={item} />
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-12 text-center text-sm text-foreground/50">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
