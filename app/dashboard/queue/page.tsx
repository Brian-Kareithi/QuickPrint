'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime, getStatusColor, formatFileSize } from '@/lib/utils';
import { Loader2, Play, CheckCircle, XCircle, Clock, Printer, Package, RefreshCw } from 'lucide-react';

export default function QueuePage() {
  const [queue, setQueue] = useState<{ awaiting: any[]; printing: any[] }>({ awaiting: [], printing: [] });
  const [ready, setReady] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    const shops = await api.shops.mine();
    if (shops.length > 0) {
      const shopId = shops[0].id;
      const [q, r] = await Promise.all([
        api.orders.queue(shopId),
        api.orders.ready(shopId),
      ]);
      setQueue(q);
      setReady(r);
    }
    setLoading(false);
  };

  useEffect(() => { loadQueue(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.orders.updateStatus(id, status);
    loadQueue();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const OrderCard = ({ order, actions }: { order: any; actions: any[] }) => (
    <div className="bg-card rounded-xl border shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{order.orderNumber}</p>
            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
          </div>
          <p className="text-xs text-foreground/60 mt-0.5">{order.customerName || 'Walk-in customer'}</p>
        </div>
      </div>
      <div className="space-y-1.5 mb-4">
        {order.items?.map((item: any) => (
          <div key={item.id} className="flex items-center gap-2 text-xs text-foreground/60">
            <Printer className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{item.fileName}</span>
            <span className="flex-shrink-0">&middot; {item.copies}x</span>
            <span className="flex-shrink-0">&middot; {item.colorMode === 'FULL_COLOR' ? 'Color' : 'B&W'}</span>
            <span className="flex-shrink-0">&middot; {item.pageCount}pgs</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-3 border-t text-xs text-foreground/50">
        <span>{formatDateTime(order.createdAt)}</span>
        <div className="flex gap-1.5">
          {actions.map((action) => (
            <Button key={action.label} size="sm" variant={action.variant || 'ghost'} onClick={() => updateStatus(order.id, action.status)}>
              <action.icon className="h-3 w-3 mr-1" /> {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const Column = ({ title, icon: Icon, orders, emptyMsg, actions }: any) => (
    <div className="bg-muted/30 rounded-xl border p-4">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-foreground/60" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <span className="text-xs font-medium text-foreground/50 bg-muted px-2 py-0.5 rounded-full">{orders.length}</span>
      </div>
      <div className="space-y-3">
        {orders.length === 0 ? (
          <p className="text-xs text-foreground/50 text-center py-10">{emptyMsg}</p>
        ) : (
          orders.map((order: any) => <OrderCard key={order.id} order={order} actions={actions} />)
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Print queue</h2>
        <Button variant="outline" size="sm" onClick={loadQueue}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
        </Button>
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <Column
          title="Awaiting" icon={Clock} orders={queue.awaiting} emptyMsg="No pending orders"
          actions={[
            { icon: Play, label: 'Start', status: 'PRINTING', variant: 'default' },
            { icon: XCircle, label: 'Cancel', status: 'CANCELLED', variant: 'destructive' },
          ]}
        />
        <Column
          title="In progress" icon={Printer} orders={queue.printing} emptyMsg="No active print jobs"
          actions={[
            { icon: CheckCircle, label: 'Complete', status: 'READY_FOR_PICKUP', variant: 'default' },
            { icon: XCircle, label: 'Cancel', status: 'CANCELLED', variant: 'destructive' },
          ]}
        />
        <Column
          title="Ready for pickup" icon={Package} orders={ready} emptyMsg="No completed orders"
          actions={[
            { icon: CheckCircle, label: 'Collected', status: 'COLLECTED', variant: 'default' },
          ]}
        />
      </div>
    </div>
  );
}
