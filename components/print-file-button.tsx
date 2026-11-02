'use client';

import { useState } from 'react';
import { Printer, Loader2, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { FilePreviewModal } from '@/components/file-preview-modal';

/**
 * Preview + Print for a customer's uploaded file (shop staff only).
 * Files are permanently deleted shortly after the order is finished.
 */
export function PrintFileButton({ item, order }: { item: any; order?: any }) {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const upload = item.upload;
  const gone = !item.uploadId || !upload || upload.isDeleted;

  if (gone) return <span className="text-[11px] text-foreground/40 flex-shrink-0">File deleted</span>;

  const btn = 'inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline flex-shrink-0 disabled:opacity-50';

  return (
    <span className="inline-flex items-center gap-3 flex-shrink-0">
      <button onClick={() => setPreview(true)} className={btn} title="Look inside this file">
        <Eye className="h-3 w-3" /> Preview
      </button>
      <button
        disabled={busy}
        className={btn}
        onClick={async () => {
          setBusy(true);
          try { await api.uploads.open(upload.id); }
          catch (err: any) { alert(err.message || 'Could not open file'); }
          finally { setBusy(false); }
        }}
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Printer className="h-3 w-3" />} Print
      </button>
      {preview && <FilePreviewModal item={item} order={order} onClose={() => setPreview(false)} />}
    </span>
  );
}
