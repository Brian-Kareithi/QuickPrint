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
        className={`fixed z-50 top-3 bottom-3 left-3 w-56 rounded-2xl bg-[#003249] text-white shadow-2xl shadow-[#003249]/30 flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-[110%]'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <Logo tone="light" size="sm" />
          <button onClick={() => setOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-primary text-white shadow-lg shadow-black/20'
                  : 'text-white/65 hover:bg-white/10 hover:text-white hover:translate-x-0.5'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="m-2.5 p-2.5 rounded-xl bg-white/10 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-[#80ced7] text-[#003249] flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-[11px] text-white/55 truncate">{roleLabel}</p>
          </div>
          <button onClick={onLogout} title="Sign out" className="p-1.5 rounded-lg hover:bg-white/15 text-white/60 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <div className="lg:pl-64 lg:pr-5">
        {/* Floating topbar */}
        <header className="sticky top-3 z-30 mx-3 lg:mx-0 h-12 rounded-2xl border border-white/60 bg-card/80 backdrop-blur-xl shadow-lg shadow-[#003249]/10 flex items-center px-4 gap-3">
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
