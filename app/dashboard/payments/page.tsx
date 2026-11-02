'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PaymentFields, paymentFromShop, emptyPayment, type PaymentValues } from '@/components/payment-fields';
import { paymentInstructions, paymentOptions } from '@/lib/payments';
import { Loader2, Save } from 'lucide-react';
import type { Shop } from '@/types';

export default function PaymentsPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [payment, setPayment] = useState<PaymentValues>(emptyPayment);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.shops.mine().then(async (shops) => {
      if (shops.length > 0) {
        const s = await api.shops.byId(shops[0].id);
        setShop(s);
        setPayment(paymentFromShop(s));
      }
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!shop) return;
    setSaving(true);
    setError('');
    try {
      const updated = await api.shops.update(shop.id, payment);
      setShop({ ...shop, ...updated });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!shop) return <p className="text-center py-12 text-sm text-foreground/60">Create your business first.</p>;

  const preview = { ...shop, ...payment } as Shop;

  return (
    <div className="grid lg:grid-cols-5 gap-5 max-w-5xl">
      <div className="lg:col-span-3 space-y-4">
        <div>
          <h2 className="text-base font-semibold">Payment details</h2>
          <p className="text-xs text-foreground/60">Customers see these after placing an order. When they pay, mark the order as paid from the queue or orders page.</p>
        </div>
        <div className="bg-card rounded-2xl border shadow-sm p-5 space-y-5">
          {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
          <PaymentFields value={payment} onChange={setPayment} />
          <Button onClick={save} disabled={saving}>
            <Save className="h-4 w-4 mr-1.5" /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save payment details'}
          </Button>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-base font-semibold">What customers see</h2>
        <div className="bg-card rounded-2xl border shadow-sm p-5 space-y-4">
          {paymentOptions(preview).map((o) => (
            <div key={o.value}>
              <p className="text-xs font-semibold text-primary mb-1">{o.label}</p>
              <div className="text-xs text-foreground/70 space-y-0.5">
                {paymentInstructions(preview, o.value, 100).map((l, i) => <p key={i}>{l}</p>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
