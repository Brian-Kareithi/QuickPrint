'use client';

import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut, Bell } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { api } from '@/lib/api';

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

export function AppShell({ nav, title, user, roleLabel, onLogout, showNotifications, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!showNotifications) return;
    let alive = true;
    const load = () => api.notifications.list()
      .then((n) => { if (alive) setUnread(n.filter((x: any) => !x.read).length); })
      .catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => { alive = false; clearInterval(t); };
  }, [showNotifications, pathname]);

  const isActive = (href: string) =>
    href === '/dashboard' || href === '/admin' || href === '/my-orders' ? pathname === href : pathname.startsWith(href);

  return (
    <div className="fit-screen overflow-hidden">
      {open && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed z-50 top-3 bottom-3 left-3 w-60 max-w-[85vw] rounded-3xl bg-card text-foreground shadow-[0_8px_30px_rgba(0,50,73,0.10)] flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-[110%]'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <Logo size="sm" />
          <button onClick={() => setOpen(false)} className="lg:hidden p-2 rounded-xl hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-ink text-white shadow-md shadow-[#003249]/25'
                  : 'text-foreground/65 hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="m-3 p-2.5 rounded-2xl bg-muted flex items-center gap-2.5">
          <Link href="/profile" onClick={() => setOpen(false)} title="My profile"
            className="flex items-center gap-2.5 flex-1 min-w-0 rounded-xl -m-1 p-1 hover:bg-card transition-colors">
            <div className="h-8 w-8 rounded-full bg-ink text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-[11px] text-foreground/55 truncate">{roleLabel}</p>
            </div>
          </Link>
          <button onClick={onLogout} title="Sign out" className="p-2 rounded-xl hover:bg-card text-foreground/60 hover:text-foreground transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <div className="lg:pl-[16.5rem] lg:pr-5 min-w-0 h-full flex flex-col">
        <header className="relative z-30 flex-shrink-0 mt-3 mx-3 lg:mx-0 h-14 rounded-3xl bg-card/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,50,73,0.07)] flex items-center px-4 gap-3">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-muted">
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-base font-semibold truncate">{title}</h2>
          <div className="flex-1" />
          <ThemeToggle />
          {showNotifications && (
            <Link href="/notifications" title="Notifications" className="relative p-2 rounded-xl hover:bg-muted transition-colors">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          )}
        </header>

        <main key={pathname} className="page-enter flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-4 sm:py-5 lg:px-0 lg:py-5 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
