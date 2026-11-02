'use client';

import { Skeleton } from '@/components/skeleton';
import { ErrorState } from '@/components/error-state';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDateTime, formatFileSize } from '@/lib/utils';
import { Shield } from 'lucide-react';

export default function AdminSystem() {
  const [health, setHealth] = useState<any>(null);
  const [retention, setRetention] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.admin.health(), api.admin.retention()])
      .then(([h, r]) => { setHealth(h); setRetention(r); })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!health) return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-2xl border shadow-sm">
        <div className="px-6 py-4 border-b"><h3 className="text-sm font-semibold">Document deletion compliance</h3></div>
        <div className="p-6 space-y-3">
          {[
            ['Files stored right now', retention?.activeFiles],
            ['Permanently erased (all time)', retention?.purgedTotal],
            ['Overdue for deletion', retention?.overdue],
            ['Next scheduled deletion', retention?.nextExpiry ? formatDateTime(retention.nextExpiry) : 'None'],
            ['Status', retention?.compliant ? 'On schedule' : 'Behind schedule'],
          ].map(([l, v]) => (
            <div key={l as string} className="flex justify-between text-sm py-2 border-b border-border/50 last:border-0">
              <span className="text-foreground/60">{l}</span><span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-2xl border shadow-sm">
        <div className="px-6 py-4 border-b"><h3 className="text-sm font-semibold">System health</h3></div>
        <div className="p-6 space-y-3 text-sm">
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-green-600" /> Status: <strong className="text-green-600">{health.status}</strong></div>
          <div className="text-foreground/60 space-y-1.5">
            <p>Uptime: {Math.round(health.uptime / 60)} minutes</p>
            <p>Uploads (24h): {health.recentUploads24h}</p>
            <p>Storage in use: {formatFileSize(health.totalStorageUsed)}</p>
            <p>Checked: {formatDateTime(health.timestamp)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
