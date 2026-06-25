'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Printer } from 'lucide-react';

export default function RegisterPage() {
  const [data, setData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "block w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-shadow";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Printer className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-foreground/60 mt-1">Start managing your print shop</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-lg">{error}</div>
          )}
          {(['name', 'email', 'password', 'phone'] as const).map((field) => (
            <div key={field}>
              <label className="text-sm font-medium block mb-1.5 capitalize">{field === 'phone' ? 'Phone (optional)' : field}</label>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={data[field]}
                onChange={(e) => setData({ ...data, [field]: e.target.value })}
                className={inputClass}
                required={field !== 'phone'}
                placeholder={field === 'phone' ? '+254 700 000 000' : `Enter your ${field}`}
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
