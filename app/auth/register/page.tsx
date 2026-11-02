'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/logo';
import { homeFor } from '@/lib/roles';

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

  const inputClass = "block w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-shadow";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <LogoMark className="h-12 w-12 mx-auto mb-4 drop-shadow-sm" />
          <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-foreground/60 mt-1">{accountType === 'OWNER' ? 'Start managing your print shop' : 'Track your print orders'}</p>
        </div>
        <form onSubmit={handleSubmit} className="page-enter bg-card/90 backdrop-blur rounded-2xl border shadow-xl shadow-black/5 p-7 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-lg">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
            {([['OWNER', 'Shop owner'], ['CUSTOMER', 'Customer']] as const).map(([v, l]) => (
              <button type="button" key={v} onClick={() => setAccountType(v)}
                className={`h-8 rounded-md text-sm font-medium transition-colors ${accountType === v ? 'bg-background shadow-sm' : 'text-foreground/60'}`}>
                {l}
              </button>
            ))}
          </div>
          {(['name', 'email', 'password', 'phone'] as const).map((field) => (
            <div key={field}>
              <label className="text-sm font-medium block mb-1.5 capitalize">{field === 'phone' ? 'Phone (optional)' : field}</label>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={data[field]}
                onChange={(e) => setData({ ...data, [field]: e.target.value })}
                className={inputClass}
                required={field !== 'phone'}
                minLength={field === 'password' ? 8 : undefined}
                placeholder={field === 'phone' ? '+254 700 000 000' : field === 'password' ? 'At least 8 characters' : `Enter your ${field}`}
              />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full h-10 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          <p className="text-center text-sm text-foreground/60">
            Already have an account? <Link href="/auth/login" className="text-primary font-medium hover:text-primary/80">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
