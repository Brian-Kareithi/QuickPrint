'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { PrintFileButton } from '@/components/print-file-button';
import { MarkPaidButton } from '@/components/mark-paid-button';
import { Button } from '@/components/ui/button';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import {
  Loader2, Play, CheckCircle, XCircle, Clock, Printer, Package, RefreshCw, Search, Volume2, VolumeX, Phone,
} from 'lucide-react';

type Action = { icon: any; label: string; status: string; variant?: any; confirm?: string };

const minutesAgo = (iso: string) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
const ageLabel = (m: number) => (m < 1 ? 'just now' : m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ${m % 60}m ago`);

function OrderCard({ order, actions, onStatus, onPaid }: {
  order: any; actions: Action[]; onStatus: (id: string, status: string) => void; onPaid: () => void;
}) {
  const age = minutesAgo(order.createdAt);
  const waiting = order.status === 'PENDING' && age >= 30;
  return (
    <div className={`bg-card rounded-2xl border shadow-sm p-4 transition-shadow hover:shadow-md ${waiting ? 'ring-1 ring-amber-300' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{order.orderNumber}</p>
            <Badge className={getStatusColor(order.status)}>{order.status.replace(/_/g, ' ')}</Badge>
          </div>
          <p className="text-xs text-foreground/60 mt-0.5 flex flex-wrap items-center gap-x-2">
            <span>{order.customerName || 'Walk-in customer'}</span>
            {order.customerPhone && (
              <a href={`tel:${order.customerPhone}`} className="inline-flex items-center gap-1 text-primary font-medium">
                <Phone className="h-3 w-3" /> {order.customerPhone}
              </a>
            )}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold">{formatCurrency(order.totalAmount)}</p>
          <p className={`text-[11px] ${waiting ? 'text-amber-700 font-medium' : 'text-foreground/50'}`}>{ageLabel(age)}</p>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        {order.items?.map((item: any) => (
          <div key={item.id} className="flex items-center gap-2 text-xs text-foreground/60">
            <Printer className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{item.fileName}</span>
            <span className="flex-shrink-0">&middot; {item.copies}x</span>
            <span className="flex-shrink-0">&middot; {item.colorMode === 'FULL_COLOR' ? 'Color' : 'B&W'}</span>
            <span className="flex-shrink-0">&middot; {item.pageCount}pgs</span>
            <span className="flex-1" />
            <PrintFileButton item={item} />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
        <MarkPaidButton order={order} onChange={onPaid} />
        <div className="flex gap-1.5">
          {actions.map((a) => (
            <Button key={a.label} size="sm" variant={a.variant || 'ghost'}
              onClick={() => { if (!a.confirm || confirm(a.confirm)) onStatus(order.id, a.status); }}>
              <a.icon className="h-3 w-3 mr-1" /> {a.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Column({ title, icon: Icon, orders, emptyMsg, actions, onStatus, onPaid }: {
  title: string; icon: any; orders: any[]; emptyMsg: string; actions: Action[];
  onStatus: (id: string, status: string) => void; onPaid: () => void;
}) {
  return (
    <div className="bg-muted/40 rounded-2xl border p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-foreground/60" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <span className="text-xs font-medium text-foreground/60 bg-card px-2 py-0.5 rounded-full">{orders.length}</span>
      </div>
      <div className="space-y-3">
        {orders.length === 0
          ? <p className="text-xs text-foreground/50 text-center py-10">{emptyMsg}</p>
          : orders.map((o) => <OrderCard key={o.id} order={o} actions={actions} onStatus={onStatus} onPaid={onPaid} />)}
      </div>
    </div>
  );
}

export default function QueuePage() {
  const [queue, setQueue] = useState<{ awaiting: any[]; printing: any[] }>({ awaiting: [], printing: [] });
  const [ready, setReady] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  const [sound, setSound] = useState(false);

  const soundRef = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);
  const seenRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    try { setSound(localStorage.getItem('queue-sound') === '1'); } catch {}
  }, []);
  useEffect(() => { soundRef.current = sound; }, [sound]);

  const beep = useCallback(() => {
    const ctx = audioRef.current;
    if (!ctx) return;
    [880, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  }, []);

  const toggleSound = () => {
    const next = !sound;
    if (next) {
      // Browsers only allow audio after a click, so it is created here.
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      audioRef.current = audioRef.current || new Ctx();
      audioRef.current.resume();
      beep();
    }
    setSound(next);
    try { localStorage.setItem('queue-sound', next ? '1' : '0'); } catch {}
  };

  const loadQueue = useCallback(async () => {
    try {
      const shops = await api.shops.mine();
      if (shops.length > 0) {
        const shopId = shops[0].id;
        const [q, r] = await Promise.all([api.orders.queue(shopId), api.orders.ready(shopId)]);
        const ids = q.awaiting.map((o: any) => o.id);
        // Chime when an order we haven't seen arrives (not on first load)
        if (seenRef.current && soundRef.current && ids.some((id: string) => !seenRef.current!.has(id))) beep();
        seenRef.current = new Set(ids);
        setQueue(q);
        setReady(r);
        setError('');
      }
    } catch (e: any) {
      setError(e.message || 'Could not load the queue');
    } finally {
      setLoading(false);
    }
  }, [beep]);

  useEffect(() => {
    loadQueue();
    const t = setInterval(loadQueue, 10000); // pick up new customer orders
    return () => clearInterval(t);
  }, [loadQueue]);

  // Show the waiting count in the browser tab so it's visible while working in another tab
  useEffect(() => {
    const n = queue.awaiting.length;
    document.title = n > 0 ? `(${n}) Print queue · QuickPrint` : 'Print queue · QuickPrint';
    return () => { document.title = 'QuickPrint'; };
  }, [queue.awaiting.length]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.orders.updateStatus(id, status);
      await loadQueue();
    } catch (e: any) {
      alert(e.message || 'Could not update the order');
    }
  };

  const matches = (o: any) => {
    if (unpaidOnly && o.isPaid) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return o.orderNumber.toLowerCase().includes(q)
      || (o.customerName || '').toLowerCase().includes(q)
      || (o.customerPhone || '').includes(q);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Print queue</h2>
          <p className="text-xs text-foreground/60">Updates every 10 seconds. Orders waiting over 30 minutes are highlighted.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Order, name or phone"
              className="pl-9 h-9 w-full rounded-xl border border-input bg-card px-3 text-sm" />
          </div>
          <button onClick={() => setUnpaidOnly((v) => !v)}
            className={`h-9 px-3 text-[13px] font-medium rounded-xl border transition-colors ${unpaidOnly ? 'bg-amber-100 border-amber-200 text-amber-800' : 'bg-card text-foreground/60 hover:bg-muted'}`}>
            Unpaid only
          </button>
          <Button variant="outline" size="sm" onClick={toggleSound} title={sound ? 'New-order sound is on' : 'Play a sound for new orders'}>
            {sound ? <Volume2 className="h-3.5 w-3.5 sm:mr-1.5 text-primary" /> : <VolumeX className="h-3.5 w-3.5 sm:mr-1.5" />}
            <span className="hidden sm:inline">{sound ? 'Sound on' : 'Sound off'}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={loadQueue}>
            <RefreshCw className="h-3.5 w-3.5 sm:mr-1.5" /><span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-xl">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-4">
        <Column
          title="Awaiting" icon={Clock} orders={queue.awaiting.filter(matches)} emptyMsg="No pending orders"
          onStatus={updateStatus} onPaid={loadQueue}
          actions={[
            { icon: Play, label: 'Start', status: 'PRINTING', variant: 'default' },
            { icon: XCircle, label: 'Cancel', status: 'CANCELLED', variant: 'destructive', confirm: 'Cancel this order?' },
          ]}
        />
        <Column
          title="In progress" icon={Printer} orders={queue.printing.filter(matches)} emptyMsg="No active print jobs"
          onStatus={updateStatus} onPaid={loadQueue}
          actions={[
            { icon: CheckCircle, label: 'Ready', status: 'READY_FOR_PICKUP', variant: 'default' },
            { icon: XCircle, label: 'Cancel', status: 'CANCELLED', variant: 'destructive', confirm: 'Cancel this order?' },
          ]}
        />
        <Column
          title="Ready for pickup" icon={Package} orders={ready.filter(matches)} emptyMsg="Nothing waiting for pickup"
          onStatus={updateStatus} onPaid={loadQueue}
          actions={[{ icon: CheckCircle, label: 'Collected', status: 'COLLECTED', variant: 'default' }]}
        />
      </div>
    </div>
  );
}
