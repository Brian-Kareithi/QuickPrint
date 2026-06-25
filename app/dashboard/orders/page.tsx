'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime, getStatusColor, getPaymentStatusColor } from '@/lib/utils';
import { Loader2, Search } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.shops.mine().then((shops) => {
      if (shops.length > 0) api.orders.list(shops[0].id).then(setOrders).finally(() => setLoading(false));
      else setLoading(false);
    });
  }, []);

  const filtered = filter ? orders.filter((o) =>
    o.orderNumber.toLowerCase().includes(filter.toLowerCase()) ||
    (o.customerName || '').toLowerCase().includes(filter.toLowerCase())
  ) : orders;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Orders</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <input
            value={filter} onChange={(e) => setFilter(e.target.value)}
            className="pl-9 h-9 w-60 rounded-lg border border-input bg-background px-3 text-sm"
            placeholder="Search orders..."
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-4 text-xs font-medium text-foreground/60 uppercase tracking-wider">Order #</th>
                <th className="text-left p-4 text-xs font-medium text-foreground/60 uppercase tracking-wider">Customer</th>
                <th className="text-left p-4 text-xs font-medium text-foreground/60 uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-medium text-foreground/60 uppercase tracking-wider">Payment</th>
                <th className="text-left p-4 text-xs font-medium text-foreground/60 uppercase tracking-wider">Amount</th>
                <th className="text-left p-4 text-xs font-medium text-foreground/60 uppercase tracking-wider">Date</th>
                <th className="text-left p-4 text-xs font-medium text-foreground/60 uppercase tracking-wider" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-medium text-sm">{order.orderNumber}</td>
                  <td className="p-4 text-sm">{order.customerName || 'Walk-in'}</td>
                  <td className="p-4"><Badge className={getStatusColor(order.status)}>{order.status}</Badge></td>
                  <td className="p-4"><Badge className={getPaymentStatusColor(order.paymentStatus)}>{order.paymentStatus}</Badge></td>
                  <td className="p-4 font-semibold text-sm">{formatCurrency(order.totalAmount)}</td>
                  <td className="p-4 text-sm text-foreground/60">{formatDateTime(order.createdAt)}</td>
                  <td className="p-4"><Button variant="outline" size="sm">View</Button></td>
                </tr>
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
