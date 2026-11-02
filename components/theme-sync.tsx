'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isPortalPath } from '@/lib/portal-theme';

/** Keeps the dark class in step with navigation: on in the portal (if chosen), always off on public pages. */
export function ThemeSync() {
  const pathname = usePathname() || '';
  useEffect(() => {
    let dark = false;
    if (isPortalPath(pathname)) {
      try {
        const saved = localStorage.getItem('theme');
        dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      } catch {}
    }
    document.documentElement.classList.toggle('dark', dark);
  }, [pathname]);
  return null;
}
