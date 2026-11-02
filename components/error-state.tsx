'use client';

import { CloudOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Shown instead of a skeleton when loading fails or times out, so the screen is never stuck. */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  compact,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  return (
    <div role="alert" className={`bg-card rounded-2xl border text-center flex flex-col items-center gap-2 ${compact ? 'p-6' : 'p-10 max-w-md mx-auto'}`}>
      <div className="h-10 w-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
        <CloudOff className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      {message && <p className="text-xs text-foreground/60 max-w-xs">{message}</p>}
      {onRetry && (
        <Button size="sm" variant="outline" className="mt-2" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Try again
        </Button>
      )}
    </div>
  );
}
