'use client';

import { usePathname } from 'next/navigation';

const SHELL_PREFIXES = ['/dashboard', '/admin', '/my-orders', '/profile', '/notifications'];

export function SiteFooter() {
  const pathname = usePathname() || '';
  const inShell = SHELL_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

  return (
    <footer
      className={`pointer-events-none fixed bottom-2.5 inset-x-0 z-40 flex justify-center px-3 ${inShell ? 'lg:pl-[16.5rem] lg:pr-5' : ''}`}
    >
      <p className="pointer-events-auto rounded-full border bg-card/85 backdrop-blur-md px-3 py-1 text-[11px] text-foreground/60 shadow-md shadow-black/10">
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
