'use client';

import { useState } from 'react';
import { Printer, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

/** Opens a customer's uploaded file (owner only) so it can be printed. Files auto-delete after retention. */
export function PrintFileButton({ item }: { item: any }) {
  const [busy, setBusy] = useState(false);
  const upload = item.upload;
  const gone = !item.uploadId || !upload || upload.isDeleted;

  if (gone) return <span className="text-[11px] text-foreground/40 flex-shrink-0">File deleted</span>;

  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try { await api.uploads.open(upload.id); }
        catch (err: any) { alert(err.message || 'Could not open file'); }
        finally { setBusy(false); }
      }}
      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline flex-shrink-0 disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Printer className="h-3 w-3" />} Print
    </button>
  );
}
