'use client';

import { usePathname } from 'next/navigation';

// Areas that use the floating sidebar; the footer is shifted so the sidebar never covers it.
const SHELL_PREFIXES = ['/dashboard', '/admin', '/my-orders', '/profile', '/notifications'];

export function SiteFooter() {
  const pathname = usePathname() || '';
  const inShell = SHELL_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

  return (
    <footer
      className={`h-11 flex items-center justify-center text-xs text-foreground/55 px-4 ${inShell ? 'lg:pl-64 lg:pr-5' : ''}`}
    >
      <p>
        Made proudly by{' '}
        <a
          href="https://kareithi.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:underline underline-offset-2"
        >
          Kareithi
        </a>
      </p>
    </footer>
  );
}
