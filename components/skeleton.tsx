import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div aria-hidden="true" className={cn('skeleton rounded-xl', className)} style={style} />;
}

function PanelBone({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('skeleton skeleton-on-panel rounded-xl', className)} />;
}

function Busy({ children, className, label = 'Loading' }: { children: React.ReactNode; className?: string; label?: string }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  );
}

const card = 'bg-card rounded-3xl border';

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', count >= 4 ? 'lg:grid-cols-4' : count === 3 ? 'lg:grid-cols-3' : '')}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn(card, 'p-4 space-y-3')}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-2.5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 5, avatar = true, bare = false }: { rows?: number; avatar?: boolean; bare?: boolean }) {
  return (
    <Busy className={bare ? '' : cn(card, 'overflow-hidden')}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b last:border-0 flex items-center gap-3">
          {avatar && <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />}
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-3.5 w-1/3 max-w-48 rounded-full" />
            <Skeleton className="h-3 w-2/3 max-w-80 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20 hidden sm:block" />
        </div>
      ))}
    </Busy>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Busy className={cn(card, 'overflow-hidden')}>
      <div className="px-4 py-3.5 border-b bg-muted/40 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className={cn('h-3 w-16 rounded-full', i > 2 && 'hidden sm:block')} />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="p-4 border-b last:border-0 flex gap-6 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn('h-3.5 rounded-full', c === 0 ? 'w-24' : 'w-16', c > 2 && 'hidden sm:block')} />
          ))}
        </div>
      ))}
    </Busy>
  );
}

export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <Busy className="max-w-2xl space-y-4">
      <div className="space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-3 w-72 max-w-full rounded-full" /></div>
      <div className={cn(card, 'p-5 space-y-5')}>
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2"><Skeleton className="h-3 w-24 rounded-full" /><Skeleton className="h-11 sm:h-10 w-full" /></div>
        ))}
        <Skeleton className="h-10 w-36" />
      </div>
    </Busy>
  );
}

export function DashboardSkeleton() {
  return (
    <Busy className="space-y-5">
      <Skeleton className="h-20 w-full rounded-3xl" />
      <StatCardsSkeleton />
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><ListSkeleton rows={4} avatar={false} /></div>
        <Skeleton className="h-56 rounded-3xl" />
      </div>
    </Busy>
  );
}

export function ChartsSkeleton() {
  return (
    <Busy className="space-y-5">
      <StatCardsSkeleton />
      <div className="grid lg:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className={cn(card, 'p-5 space-y-4')}>
            <Skeleton className="h-4 w-32 rounded-full" />
            <div className="h-56 flex items-end gap-2">
              {[40, 65, 50, 80, 60, 90, 70, 55].map((h, j) => <Skeleton key={j} className="flex-1 rounded-lg" style={{ height: `${h}%` }} />)}
            </div>
          </div>
        ))}
      </div>
    </Busy>
  );
}

export function QueueSkeleton() {
  return (
    <Busy className="space-y-4">
      <div className="flex justify-between gap-3"><div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-3 w-64 max-w-full rounded-full" /></div><Skeleton className="h-9 w-56 hidden sm:block" /></div>
      <div className="grid lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((c) => (
          <div key={c} className="bg-muted/40 rounded-3xl border p-3 sm:p-4 space-y-3">
            <Skeleton className="h-4 w-28 rounded-full" />
            {[0, 1].map((i) => (
              <div key={i} className={cn(card, 'p-4 space-y-3')}>
                <div className="flex justify-between"><Skeleton className="h-4 w-28 rounded-full" /><Skeleton className="h-5 w-16 rounded-full" /></div>
                <Skeleton className="h-3 w-3/4 rounded-full" />
                <Skeleton className="h-3 w-1/2 rounded-full" />
                <div className="flex justify-between pt-2"><Skeleton className="h-6 w-20" /><Skeleton className="h-8 w-24" /></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Busy>
  );
}

export function MessagesSkeleton() {
  return (
    <Busy className="h-full min-h-[30rem] flex gap-4" label="Loading chats">
      <div className={cn(card, 'w-full md:w-80 flex-shrink-0 overflow-hidden')}>
        <div className="p-4 border-b space-y-3">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-3 w-48 max-w-full rounded-full" />
          <div className="flex gap-1.5">{[56, 72, 40].map((w, i) => <Skeleton key={i} className="h-6 rounded-full" style={{ width: w }} />)}</div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-28 rounded-full" /><Skeleton className="h-3 w-40 max-w-full rounded-full" /></div>
          </div>
        ))}
      </div>
      <div className={cn(card, 'hidden md:flex flex-1 flex-col overflow-hidden')}>
        <div className="px-4 py-3 border-b flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-2"><Skeleton className="h-3.5 w-28 rounded-full" /><Skeleton className="h-3 w-40 rounded-full" /></div>
        </div>
        <div className="flex-1 p-4"><ChatBubblesSkeleton /></div>
        <div className="p-3 flex gap-2"><Skeleton className="h-10 flex-1 rounded-2xl" /><Skeleton className="h-10 w-10 rounded-full" /></div>
      </div>
    </Busy>
  );
}

export function ChatBubblesSkeleton() {
  const rows: [boolean, string][] = [[false, 'w-2/3'], [true, 'w-1/2'], [false, 'w-3/5'], [true, 'w-2/5']];
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <Skeleton className="self-center h-5 w-56 max-w-full rounded-full" />
      {rows.map(([mine, w], i) => (
        <Skeleton key={i} className={cn('h-10 rounded-2xl', w, mine ? 'self-end rounded-br-md' : 'self-start rounded-bl-md')} />
      ))}
    </div>
  );
}

export interface ShopHint { open: boolean; bg?: string; brand?: string }

export function ShopPortalSkeleton({ hint }: { hint?: ShopHint | null }) {
  const closed = hint?.open === false;
  const bg = hint?.bg || undefined;

  if (closed) {
    return (
      <div className="fit-screen overflow-hidden flex flex-col p-3" style={{ backgroundColor: bg }} role="status" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading shop…</span>
        <div className="flex-1 min-h-0 overflow-hidden rounded-3xl bg-panel flex items-center justify-center p-5">
          <div className="w-full max-w-md flex flex-col items-center gap-3">
            <PanelBone className="h-[clamp(4.5rem,13vh,7rem)] aspect-square rounded-full" />
            <PanelBone className="h-3 w-28 rounded-full mt-2" />
            <PanelBone className="h-9 w-64 max-w-full" />
            <PanelBone className="h-9 w-44 max-w-full" />
            <PanelBone className="h-3 w-56 max-w-full rounded-full mt-1" />
            <div className="w-full space-y-2 mt-3">{[0, 1].map((i) => <PanelBone key={i} className="h-12 w-full rounded-2xl" />)}</div>
            <PanelBone className="h-12 w-full mt-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fit-screen overflow-hidden p-3" style={{ backgroundColor: bg }} role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading shop…</span>
      <div className="h-full w-full max-w-lg mx-auto flex flex-col gap-3">
        <div className="rounded-3xl bg-panel px-4 py-3 flex items-center gap-3">
          <PanelBone className="h-12 w-12 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-2"><PanelBone className="h-5 w-40 max-w-full rounded-full" /><PanelBone className="h-3 w-56 max-w-full rounded-full" /></div>
          <PanelBone className="h-6 w-16 rounded-full hidden sm:block" />
        </div>
        <div className="flex justify-center gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}</div>
        <div className="flex-1 min-h-0 flex flex-col justify-center gap-3">
          <div className="rounded-3xl border-2 border-dashed border-foreground/10 bg-card p-[clamp(1.25rem,6vh,2.5rem)] flex flex-col items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <Skeleton className="h-4 w-52 max-w-full rounded-full" />
            <Skeleton className="h-3 w-40 rounded-full" />
            <Skeleton className="h-3 w-64 max-w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShellSkeleton() {
  return (
    <div className="fit-screen overflow-hidden" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <aside className="hidden lg:flex fixed top-3 bottom-3 left-3 w-60 rounded-3xl bg-card shadow-[0_8px_30px_rgba(0,50,73,0.10)] flex-col p-3 gap-1">
        <div className="flex items-center gap-2.5 h-14 px-1"><Skeleton className="h-7 w-7 rounded-lg" /><Skeleton className="h-4 w-24 rounded-full" /></div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3.5 py-2.5"><Skeleton className="h-4 w-4 rounded-md" /><Skeleton className="h-3.5 rounded-full" style={{ width: 60 + ((i * 23) % 50) }} /></div>
        ))}
        <div className="flex-1" />
        <div className="p-2.5 rounded-2xl bg-muted flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-full bg-card" />
          <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-24 rounded-full bg-card" /><Skeleton className="h-2.5 w-16 rounded-full bg-card" /></div>
        </div>
      </aside>
      <div className="lg:pl-[16.5rem] lg:pr-5 h-full flex flex-col">
        <div className="mt-3 mx-3 lg:mx-0 h-14 rounded-3xl bg-card shadow-[0_4px_20px_rgba(0,50,73,0.07)] flex items-center px-4 gap-3">
          <Skeleton className="h-5 w-5 rounded-md lg:hidden" />
          <Skeleton className="h-4 w-36 rounded-full" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
        <div className="px-3 lg:px-0 py-5"><DashboardSkeleton /></div>
      </div>
    </div>
  );
}
