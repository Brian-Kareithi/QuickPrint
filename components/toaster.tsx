'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export interface Toast {
  id?: string;
  title: string;
  body?: string;
  /** Emoji or short text shown in the round badge (e.g. the customer's fruit). */
  icon?: string;
  onClick?: () => void;
  /** ms before it hides; default 6000. */
  duration?: number;
}

type Listener = (t: Required<Pick<Toast, 'id'>> & Toast) => void;
const listeners = new Set<Listener>();

/** Show a toast from anywhere (no React context needed). Same id replaces the previous toast. */
export function toast(t: Toast) {
  const withId = { ...t, id: t.id || Math.random().toString(36).slice(2) };
  listeners.forEach((l) => l(withId));
}

/** Mount once (root layout). Renders a stack of glass toasts at the top right (top centre on phones). */
export function Toaster() {
  const [items, setItems] = useState<(Toast & { id: string })[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = (id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setItems((list) => list.filter((t) => t.id !== id));
  };
  const arm = (id: string, ms: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.set(id, setTimeout(() => dismiss(id), ms));
  };

  useEffect(() => {
    const onToast: Listener = (t) => {
      setItems((list) => [t, ...list.filter((x) => x.id !== t.id)].slice(0, 4));
      arm(t.id, t.duration ?? 6000);
    };
    listeners.add(onToast);
    const map = timers.current;
    return () => { listeners.delete(onToast); map.forEach(clearTimeout); };
    // arm/dismiss only touch refs and state setters, so subscribing once is correct.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed z-[60] top-3 inset-x-3 sm:inset-x-auto sm:right-4 sm:w-96 flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          onMouseEnter={() => clearTimeout(timers.current.get(t.id))}
          onMouseLeave={() => arm(t.id, 2500)}
          className="glass glass-strong anim-panel pointer-events-auto rounded-3xl p-3 pr-2 flex items-start gap-3"
          style={{ transformOrigin: 'top right' }}
        >
          <button
            onClick={() => { t.onClick?.(); dismiss(t.id); }}
            className="flex items-start gap-3 flex-1 min-w-0 text-left"
          >
            {t.icon && <span className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">{t.icon}</span>}
            <span className="min-w-0 flex-1 pt-0.5">
              <span className="block text-sm font-semibold truncate">{t.title}</span>
              {t.body && <span className="block text-xs text-foreground/70 line-clamp-2 break-words mt-0.5">{t.body}</span>}
            </span>
          </button>
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center text-foreground/50 flex-shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
