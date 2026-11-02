'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { navFor } from '@/lib/nav';
import { AppShell } from '@/components/app-shell';

/** Signed-in page frame for screens every role can open (profile, notifications). */
export function RoleShell({ title, children }: { title: string; children: ReactNode }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/auth/login');
  }, [loading, isAuthenticated, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const { nav, roleLabel } = navFor(user.role);
  return (
    <AppShell nav={nav} title={title} user={user} roleLabel={roleLabel} onLogout={logout} showNotifications={user.role === 'OWNER'}>
      {children}
    </AppShell>
  );
}
