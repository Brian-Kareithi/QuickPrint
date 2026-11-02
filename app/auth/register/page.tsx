'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { AuthShell } from '@/components/auth-shell';
import { AuthField } from '@/components/auth-field';
import { homeFor } from '@/lib/roles';

type FieldKey = 'name' | 'email' | 'password' | 'phone';

// label, input type, autocomplete hint, placeholder
const FIELDS: Record<FieldKey, [string, string, string, string]> = {
  name: ['Full name', 'text', 'name', 'Enter your name'],
  email: ['Email', 'email', 'email', 'you@example.com'],
  password: ['Password', 'password', 'new-password', 'At least 8 characters'],
  phone: ['Phone (optional)', 'tel', 'tel', '+254 700 000 000'],
};

export default function RegisterPage() {
  const [data, setData] = useState({ name: '', email: '', password: '', phone: '' });
  const [accountType, setAccountType] = useState<'OWNER' | 'CUSTOMER'>('OWNER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register({ ...data, accountType });
      router.push(homeFor(user));
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle={accountType === 'OWNER' ? 'Start managing your print shop.' : 'Track your print orders.'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-xl">{error}</div>}
        <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-xl">
          {([['OWNER', 'Shop owner'], ['CUSTOMER', 'Customer']] as const).map(([v, l]) => (
            <button type="button" key={v} onClick={() => setAccountType(v)}
              className={`h-10 rounded-lg text-sm font-medium transition-colors ${accountType === v ? 'bg-card shadow-sm' : 'text-foreground/60'}`}>
              {l}
            </button>
          ))}
        </div>
        {(Object.keys(FIELDS) as FieldKey[]).map((key) => {
          const [label, type, autoComplete, placeholder] = FIELDS[key];
          return (
            <AuthField key={key} label={label} type={type} autoComplete={autoComplete} placeholder={placeholder}
              value={data[key]} onChange={(e) => setData({ ...data, [key]: e.target.value })}
              required={key !== 'phone'} minLength={key === 'password' ? 8 : undefined} />
          );
        })}
        <button type="submit" disabled={loading}
          className="w-full h-12 bg-[#003249] text-white rounded-xl text-sm font-medium hover:bg-[#003249]/90 transition-colors disabled:opacity-60 shadow-md shadow-[#003249]/20 inline-flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        <p className="text-center text-sm text-foreground/60">
          Already have an account? <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
