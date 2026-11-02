'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/logo';
import { homeFor } from '@/lib/roles';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(homeFor(user));
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <LogoMark className="h-12 w-12 mx-auto mb-4 drop-shadow-sm" />
          <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-foreground/60 mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="page-enter bg-card/90 backdrop-blur rounded-2xl border shadow-xl shadow-black/5 p-7 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-lg">{error}</div>
          )}
          <div>
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="block w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
              required placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="block w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
              required placeholder="Enter your password"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-10 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="text-center text-sm text-foreground/60">
            No account? <Link href="/auth/register" className="text-primary font-medium hover:text-primary/80">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
