'use client';

import { useState, type ComponentType, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut, Bell } from 'lucide-react';
import { Logo } from '@/components/logo';

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface Props {
  nav: NavItem[];
  title: ReactNode;
  user: { name: string; email: string; role: string };
  roleLabel: string;
  onLogout: () => void;
  showNotifications?: boolean;
  children: ReactNode;
}

/**
 * Floating sidebar + floating topbar used by every signed-in area
 * (shop owner / cashier dashboard, super admin, customer).
 */
export function AppShell({ nav, title, user, roleLabel, onLogout, showNotifications, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/dashboard' || href === '/admin' || href === '/my-orders' ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen">
      {open && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      {/* Floating sidebar */}
      <aside
        className={`fixed z-50 top-3 bottom-3 left-3 w-64 rounded-2xl border bg-card/90 backdrop-blur-xl shadow-xl shadow-black/5 flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-[110%]'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-5">
          <Logo />
          <button onClick={() => setOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'text-foreground/60 hover:bg-muted hover:text-foreground hover:translate-x-0.5'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="m-3 p-3 rounded-xl bg-muted/70 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-[11px] text-foreground/50 truncate">{roleLabel}</p>
          </div>
          <button onClick={onLogout} title="Sign out" className="p-1.5 rounded-lg hover:bg-background text-foreground/50 hover:text-foreground transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <div className="lg:pl-72 lg:pr-6">
        {/* Floating topbar */}
        <header className="sticky top-3 z-30 mx-3 lg:mx-0 h-14 rounded-2xl border bg-card/80 backdrop-blur-xl shadow-lg shadow-black/5 flex items-center px-4 gap-3">
          <button onClick={() => setOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted">
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-semibold truncate">{title}</h2>
          <div className="flex-1" />
          {showNotifications && (
            <Link href="/notifications" className="p-2 rounded-xl hover:bg-muted transition-colors">
              <Bell className="h-4 w-4" />
            </Link>
          )}
        </header>

        <main key={pathname} className="page-enter px-3 py-5 lg:px-0 lg:py-6 pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
