'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { homeFor } from '@/lib/roles';
import { AppShell } from '@/components/app-shell';
import { navFor } from '@/lib/nav';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) router.push('/auth/login');
    else if (user && user.role !== 'ADMIN') router.replace(homeFor(user));
  }, [loading, isAuthenticated, user, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return <div className="min-h-screen flex items-center justify-center"><div className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  }

  return (
    <AppShell nav={navFor('ADMIN').nav} title="Super admin" user={user} roleLabel="Super admin" onLogout={logout}>
      {children}
    </AppShell>
  );
}
