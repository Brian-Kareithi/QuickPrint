'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { navFor } from '@/lib/nav';
import { AppShell } from '@/components/app-shell';
import { ShellSkeleton } from '@/components/skeleton';
import { ErrorState } from '@/components/error-state';

export function RoleShell({ title, children }: { title: string; children: ReactNode }) {
  const { user, isAuthenticated, loading, logout, authError, retryAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authError && !isAuthenticated) router.push('/auth/login');
  }, [loading, authError, isAuthenticated, router]);

  if (loading) return <ShellSkeleton />;
  if (authError && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorState title="Can't open your account" message={authError} onRetry={retryAuth} />
      </div>
    );
  }
  if (!user) return <ShellSkeleton />;

  const { nav, roleLabel } = navFor(user.role);
  return (
    <AppShell nav={nav} title={title} user={user} roleLabel={roleLabel} onLogout={logout} showNotifications={user.role === 'OWNER'}>
      {children}
    </AppShell>
  );
}
