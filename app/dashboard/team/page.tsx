'use client';

import { FormSkeleton, ListSkeleton } from '@/components/skeleton';
import { ErrorState } from '@/components/error-state';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Trash2, Copy, Check, KeyRound } from 'lucide-react';

const empty = { name: '', email: '', phone: '', password: '' };

const randomPassword = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.getRandomValues(new Uint32Array(10)), (n) => chars[n % chars.length]).join('');
};

export default function TeamPage() {
  const { isOwner, loading: authLoading } = useAuth();
  const [shopId, setShopId] = useState<string | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const shops = await api.shops.mine();
      if (shops.length > 0) {
        setShopId(shops[0].id);
        setStaff(await api.shops.staff(shops[0].id));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isOwner) load(); else if (!authLoading) setLoading(false); }, [isOwner, authLoading, load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) return;
    setSaving(true);
    setError('');
    try {
      await api.shops.addStaff(shopId, form);
      setCreated({ email: form.email, password: form.password });
      setForm(empty);
      setStaff(await api.shops.staff(shopId));
    } catch (err: any) {
      setError(err.message || 'Could not add cashier');
    } finally {
      setSaving(false);
    }
  };

  // Give a cashier a fresh temporary password (e.g. they forgot theirs) and show it once.
  const resetPassword = async (userId: string, name: string, email: string) => {
    if (!shopId || !confirm(`Set a new temporary password for ${name}? Their old password will stop working.`)) return;
    const password = randomPassword();
    setError('');
    try {
      await api.shops.resetStaffPassword(shopId, userId, password);
      setCreated({ email, password });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Could not reset the password');
    }
  };

  const remove = async (userId: string, name: string) => {
    if (!shopId || !confirm(`Remove ${name} from your shop?`)) return;
    try {
      await api.shops.removeStaff(shopId, userId);
      setStaff((prev) => prev.filter((s) => s.userId !== userId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="max-w-3xl space-y-5">
      <FormSkeleton fields={4} />
      <ListSkeleton rows={3} />
    </div>
  );
  if (!isOwner) return <p className="text-center py-12 text-sm text-foreground/60">Only the shop owner can manage the team.</p>;
  if (!shopId && error) return <ErrorState message={error} onRetry={() => { setLoading(true); setError(''); load(); }} />;
  if (!shopId) return <p className="text-center py-12 text-sm text-foreground/60">Create your shop first.</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Team</h2>
        <p className="text-sm text-foreground/60">Cashiers can see orders, open and print customer files, and mark orders collected. They can&apos;t change prices, branding or the team.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-xl">{error}</div>}

      {created && (
        <div className="bg-green-50 border border-green-100 text-green-800 text-sm p-4 rounded-xl space-y-2">
          <p className="font-medium">Cashier added. Share these login details with them:</p>
          <p className="font-mono text-xs bg-card/70 rounded-lg p-2.5">Email: {created.email}{created.password && <><br />Password: {created.password}</>}</p>
          <Button size="sm" variant="outline" onClick={() => {
            navigator.clipboard?.writeText(`QuickPrint login\nEmail: ${created.email}\nPassword: ${created.password}`);
            setCopied(true); setTimeout(() => setCopied(false), 2000);
          }}>
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />} {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      )}

      <form onSubmit={add} className="bg-card rounded-2xl border shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><UserPlus className="h-4 w-4" /> Invite a cashier</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="text-xs text-foreground/60 block mb-1.5">Full name</label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="text-xs text-foreground/60 block mb-1.5">Email</label>
            <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="text-xs text-foreground/60 block mb-1.5">Phone (optional)</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div>
            <label className="text-xs text-foreground/60 block mb-1.5">Temporary password</label>
            <div className="flex gap-2">
              <Input required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="min. 8 characters" />
              <Button type="button" variant="outline" onClick={() => setForm({ ...form, password: randomPassword() })}>Generate</Button>
            </div>
          </div>
        </div>
        <Button type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add cashier'}</Button>
      </form>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b"><h3 className="text-sm font-semibold">Cashiers ({staff.length})</h3></div>
        {staff.length === 0 ? (
          <p className="text-sm text-foreground/50 text-center py-10">No cashiers yet</p>
        ) : staff.map((s) => (
          <div key={s.id} className="flex items-center gap-3 px-6 py-3.5 border-b last:border-0 hover:bg-muted/30 transition-colors">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">{s.user.name.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.user.name}</p>
              <p className="text-xs text-foreground/50 truncate">{s.user.email}{s.user.phone ? ` · ${s.user.phone}` : ''}</p>
            </div>
            <Button size="sm" variant="ghost" title="Reset password" onClick={() => resetPassword(s.userId, s.user.name, s.user.email)}><KeyRound className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="ghost" title="Remove from team" onClick={() => remove(s.userId, s.user.name)}><Trash2 className="h-3.5 w-3.5 text-red-600" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
