'use client';

import { ListSkeleton } from '@/components/skeleton';
import { ErrorState } from '@/components/error-state';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { ScrollText } from 'lucide-react';

const describe = (log: any): string => {
  const m = log.metadata || {};
  switch (log.action) {
    case 'ROLE_CHANGED': return `changed ${m.email}'s role from ${m.from} to ${m.to}`;
    case 'USER_SUSPENDED': return `suspended user ${m.email}`;
    case 'USER_ACTIVATED': return `reactivated user ${m.email}`;
    case 'SHOP_SUSPENDED': return `suspended shop ${m.name}`;
    case 'SHOP_ACTIVATED': return `reactivated shop ${m.name}`;
    case 'SHOP_OWNER_CHANGED': return `transferred shop ${m.name} from ${m.from} to ${m.to}`;
    default: return log.action.toLowerCase().replace(/_/g, ' ');
  }
};

export default function AdminActivity() {
  const [data, setData] = useState<{ logs: any[]; total: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin.activity().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data) return <ListSkeleton rows={6} />;

  return (
    <div className="max-w-3xl space-y-3">
      <p className="text-sm text-foreground/60">A record of admin actions: role changes, suspensions and reactivations.</p>
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        {data.logs.length === 0 ? (
          <div className="text-center py-14">
            <ScrollText className="h-8 w-8 text-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-foreground/50">Nothing yet. Admin actions will be listed here.</p>
          </div>
        ) : data.logs.map((l) => (
          <div key={l.id} className="px-4 py-3 border-b last:border-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <p className="text-sm">
              <span className="font-medium">{l.actor?.name || 'Unknown admin'}</span>{' '}
              <span className="text-foreground/70">{describe(l)}</span>
            </p>
            <span className="text-[11px] text-foreground/45 flex-shrink-0">{formatDateTime(l.createdAt)}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-foreground/50">{data.total} entries</p>
    </div>
  );
}
