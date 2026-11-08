import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-lg bg-foreground/10', className)} />;
}

function Busy({ children, className, label = 'Loading' }: { children: React.ReactNode; className?: string; label?: string }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', count >= 4 ? 'lg:grid-cols-4' : count === 3 ? 'lg:grid-cols-3' : '')}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-2xl border p-4 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 5, avatar = true, bare = false }: { rows?: number; avatar?: boolean; bare?: boolean }) {
  return (
    <Busy className={bare ? '' : 'bg-card rounded-2xl border overflow-hidden'}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b last:border-0 flex items-center gap-3">
          {avatar && <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-20 hidden sm:block" />
        </div>
      ))}
    </Busy>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Busy className="bg-card rounded-2xl border overflow-hidden">
      <div className="p-4 border-b bg-muted/40 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-3 w-16" />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="p-4 border-b last:border-0 flex gap-6 items-center">
          {Array.from({ length: cols }).map((_, c) => <Skeleton key={c} className={cn('h-3.5', c === 0 ? 'w-24' : 'w-16')} />)}
        </div>
      ))}
    </Busy>
  );
}

export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <Busy className="max-w-2xl space-y-4">
      <div className="space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-3 w-72" /></div>
      <div className="bg-card rounded-2xl border p-5 space-y-5">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-full rounded-xl" /></div>
        ))}
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
    </Busy>
  );
}

export function DashboardSkeleton() {
  return (
    <Busy className="space-y-5">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <StatCardsSkeleton />
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><ListSkeleton rows={4} avatar={false} /></div>
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </Busy>
  );
}

export function ChartsSkeleton() {
  return (
    <Busy className="space-y-5">
      <StatCardsSkeleton />
      <div className="grid lg:grid-cols-2 gap-4">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </Busy>
  );
}

export function QueueSkeleton() {
  return (
    <Busy className="space-y-4">
      <div className="flex justify-between gap-3"><div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-3 w-64" /></div><Skeleton className="h-9 w-56 rounded-xl hidden sm:block" /></div>
      <div className="grid lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((c) => (
          <div key={c} className="bg-muted/40 rounded-2xl border p-3 sm:p-4 space-y-3">
            <Skeleton className="h-4 w-28" />
            {[0, 1].map((i) => (
              <div key={i} className="bg-card rounded-2xl border p-4 space-y-3">
                <div className="flex justify-between"><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-14" /></div>
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between pt-2"><Skeleton className="h-6 w-20" /><Skeleton className="h-8 w-24 rounded-lg" /></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Busy>
  );
}

export function ShopPortalSkeleton() {
  return (
    <div className="min-h-screen" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading shop…</span>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="flex gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="flex-1 h-1 rounded-full" />)}</div>
        <div className="border-2 border-dashed border-foreground/10 rounded-xl p-12 flex flex-col items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ShellSkeleton() {
  return (
    <div className="min-h-screen" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <aside className="hidden lg:flex fixed top-3 bottom-3 left-3 w-60 rounded-3xl bg-card border flex-col p-4 gap-3">
        <div className="flex items-center gap-2.5 h-10"><Skeleton className="h-8 w-8 rounded-xl" /><Skeleton className="h-4 w-24" /></div>
        {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-2xl" />)}
        <div className="flex-1" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </aside>
      <div className="lg:pl-[16.5rem] lg:pr-5">
        <div className="mx-3 lg:mx-0 mt-3"><Skeleton className="h-14 w-full rounded-3xl" /></div>
        <div className="px-3 lg:px-0 py-5"><DashboardSkeleton /></div>
      </div>
    </div>
  );
}
