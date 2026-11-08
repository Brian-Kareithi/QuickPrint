'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => { setDark(document.documentElement.classList.contains('dark')); }, []);

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next = !dark;
    const apply = () => {
      document.documentElement.classList.toggle('dark', next);
      try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
      setDark(next);
    };

    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      apply();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = doc.startViewTransition(() => flushSync(apply));
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {});
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`relative h-9 w-9 rounded-xl hover:bg-muted flex items-center justify-center overflow-hidden ${className}`}
    >
      <Sun className={`absolute h-4 w-4 transition-all duration-500 ${dark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} />
      <Moon className={`absolute h-4 w-4 transition-all duration-500 ${dark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
    </button>
  );
}
