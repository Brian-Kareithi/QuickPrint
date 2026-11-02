'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogoMark } from '@/components/logo';
import { PaymentFields, emptyPayment, type PaymentValues } from '@/components/payment-fields';
import type { Shop } from '@/types';

/** First-run form: the owner creates their business (their own isolated shop on the platform). */
export function OnboardingForm({ onCreated }: { onCreated: (shop: Shop) => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '', email: user?.email || '', phone: user?.phone || '', address: '', description: '', welcomeMessage: '',
  });
  const [payment, setPayment] = useState<PaymentValues>(emptyPayment);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const shop = await api.shops.create({ ...form, ...payment });
      onCreated(shop);
    } catch (err: any) {
      setError(err.message || 'Could not create your business');
    } finally {
      setSaving(false);
    }
  };

  const label = 'text-xs font-medium text-foreground/60 block mb-1';

  return (
    <form onSubmit={submit} className="max-w-2xl mx-auto bg-card rounded-2xl border shadow-xl shadow-[#003249]/5 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <LogoMark className="h-10 w-10" />
        <div>
          <h2 className="text-base font-semibold">Set up your business</h2>
          <p className="text-xs text-foreground/60">Welcome, {user?.name}. This creates your shop page and QR code. You can change everything later.</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-lg">{error}</div>}

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Business details</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={label}>Business name *</label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Kamau Cyber Cafe" />
          </div>
          <div>
            <label className={label}>Owner</label>
            <Input value={user?.name || ''} disabled />
          </div>
          <div>
            <label className={label}>Business phone *</label>
            <Input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07XX XXX XXX" />
          </div>
          <div>
            <label className={label}>Business email</label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className={label}>Location / address</label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, building, town" />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>What you do (optional)</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Printing, copying, scanning, binding" />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Welcome message for customers (optional)</label>
            <Input value={form.welcomeMessage} onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })} placeholder="Upload your documents and we will have them ready" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/50">How you get paid</h3>
        <PaymentFields value={payment} onChange={setPayment} />
      </section>

      <Button type="submit" size="lg" className="w-full" disabled={saving || !form.name.trim() || !form.phone.trim()}>
        {saving ? 'Creating your business...' : 'Create business'}
      </Button>
    </form>
  );
}
