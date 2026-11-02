'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleShell } from '@/components/role-shell';
import { navFor } from '@/lib/nav';
import { formatDate } from '@/lib/utils';
import { Save, KeyRound } from 'lucide-react';

const label = 'text-xs font-medium text-foreground/60 block mb-1';
const ok = 'bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm p-3 rounded-xl';
const bad = 'bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-xl';

function ProfileContent() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone || '' });
  }, [user]);

  if (!user) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await api.auth.updateProfile(form);
      await refresh();
      setProfileMsg({ ok: true, text: 'Profile updated.' });
    } catch (err: any) {
      setProfileMsg({ ok: false, text: err.message || 'Could not save' });
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (pw.next !== pw.confirm) return setPwMsg({ ok: false, text: 'The new passwords do not match.' });
    setSavingPw(true);
    try {
      await api.auth.changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      setPwMsg({ ok: true, text: 'Password changed.' });
    } catch (err: any) {
      setPwMsg({ ok: false, text: err.message || 'Could not change password' });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-card rounded-2xl border shadow-sm p-5 flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-[#003249] text-white flex items-center justify-center text-xl font-semibold flex-shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{user.name}</p>
          <p className="text-sm text-foreground/60 truncate">{user.email}</p>
          <p className="text-xs text-foreground/50 mt-0.5">
            {navFor(user.role).roleLabel}{user.createdAt ? ` · Member since ${formatDate(user.createdAt)}` : ''}
          </p>
        </div>
      </div>

      <form onSubmit={saveProfile} className="bg-card rounded-2xl border shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-semibold">Your details</h3>
        {profileMsg && <div className={profileMsg.ok ? ok : bad}>{profileMsg.text}</div>}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={label}>Full name</label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={label}>Phone</label>
            <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07XX XXX XXX" />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Email (used to sign in)</label>
            <Input value={user.email} disabled />
          </div>
        </div>
        <Button type="submit" disabled={savingProfile}>
          <Save className="h-4 w-4 mr-1.5" /> {savingProfile ? 'Saving...' : 'Save changes'}
        </Button>
      </form>

      <form onSubmit={changePassword} className="bg-card rounded-2xl border shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-semibold">Change password</h3>
        {pwMsg && <div className={pwMsg.ok ? ok : bad}>{pwMsg.text}</div>}
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className={label}>Current password</label>
            <Input required type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          </div>
          <div>
            <label className={label}>New password</label>
            <Input required type="password" minLength={8} autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} placeholder="8+ characters" />
          </div>
          <div>
            <label className={label}>Confirm new password</label>
            <Input required type="password" minLength={8} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </div>
        </div>
        <Button type="submit" variant="outline" disabled={savingPw}>
          <KeyRound className="h-4 w-4 mr-1.5" /> {savingPw ? 'Updating...' : 'Update password'}
        </Button>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RoleShell title="My profile">
      <ProfileContent />
    </RoleShell>
  );
}
