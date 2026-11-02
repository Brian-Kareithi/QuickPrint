'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { homeFor } from '@/lib/roles';
import { AppShell } from '@/components/app-shell';
import { ShellSkeleton } from '@/components/skeleton';
import { ErrorState } from '@/components/error-state';
import { navFor } from '@/lib/nav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, logout, authError, retryAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || authError) return;
    if (!isAuthenticated) router.push('/auth/login');
    else if (user && user.role !== 'ADMIN') router.replace(homeFor(user));
  }, [loading, authError, isAuthenticated, user, router]);

  if (loading) return <ShellSkeleton />;
  if (authError && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorState title="Can't open your account" message={authError} onRetry={retryAuth} />
      </div>
    );
  }
  if (!user || user.role !== 'ADMIN') return <ShellSkeleton />;

  return (
    <AppShell nav={navFor('ADMIN').nav} title="Super admin" user={user} roleLabel="Super admin" onLogout={logout}>
      {children}
    </AppShell>
  );
}
