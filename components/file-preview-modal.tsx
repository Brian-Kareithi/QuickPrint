'use client';

import { Skeleton } from '@/components/skeleton';

import { useEffect, useRef, useState } from 'react';
import { X, Printer, FileWarning } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { formatFileSize, getTimeRemaining } from '@/lib/utils';

type Kind = 'pdf' | 'image' | 'docx' | 'none';

const ext = (name: string) => (name.split('.').pop() || '').toLowerCase();
const kindOf = (name: string, mime: string): Kind => {
  const e = ext(name);
  if (e === 'pdf' || mime === 'application/pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png'].includes(e) || mime.startsWith('image/')) return 'image';
  if (e === 'docx') return 'docx';
  return 'none';
};

const LABEL: Record<string, string> = {
  FULL_COLOR: 'Colour', BLACK_WHITE: 'B&W', DOUBLE_SIDED: 'Double-sided', SINGLE_SIDED: 'Single-sided',
  NONE: '', SPIRAL: 'Spiral bind', COMB: 'Comb bind', TAPE: 'Tape bind', HARDCOVER: 'Hardcover',
  STAPLING: 'Staple', LAMINATION: 'Laminate', FOLDING: 'Fold', HOLE_PUNCH: 'Hole punch',
};

/**
 * Lets the cashier look inside a customer's file before printing ("is this the right document?").
 * PDFs and images open natively, Word (.docx) files are rendered in the browser. Nothing is sent
 * to a third party: the file is fetched from our own server with the cashier's login.
 */
export function FilePreviewModal({ item, order, onClose }: { item: any; order?: any; onClose: () => void }) {
  const upload = item.upload;
  const kind = kindOf(upload.originalName, upload.mimeType || '');
  const [url, setUrl] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const docxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let revoke: string | null = null;
    let cancelled = false;

    (async () => {
      if (kind === 'none') { setState('ready'); return; }
      try {
        const blob = await api.uploads.blob(upload.id);
        if (cancelled) return;
        if (kind === 'docx') {
          const { renderAsync } = await import('docx-preview');
          if (cancelled || !docxRef.current) return;
          await renderAsync(blob, docxRef.current, undefined, { inWrapper: true, breakPages: true, ignoreLastRenderedPageBreak: true });
        } else {
          revoke = URL.createObjectURL(blob);
          setUrl(revoke);
        }
        setState('ready');
      } catch (e: any) {
        if (!cancelled) { setError(e.message || 'Could not load the file'); setState('error'); }
      }
    })();

    return () => { cancelled = true; if (revoke) URL.revokeObjectURL(revoke); };
  }, [upload.id, kind]);

  // Close with Esc, and stop the page behind from scrolling
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const options = [
    `${item.copies}× copies`,
    item.pageCount ? `${item.pageCount} page${item.pageCount === 1 ? '' : 's'}` : '',
    LABEL[item.colorMode], item.paperSize, LABEL[item.layout], LABEL[item.bindingType], LABEL[item.finishingType],
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch sm:items-center justify-center sm:p-6 bg-black/60 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className="bg-card text-foreground w-full sm:max-w-5xl h-full sm:h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Preview of ${upload.originalName}`}
      >
        <div className="flex items-start justify-between gap-3 p-4 border-b">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{upload.originalName}</p>
            <p className="text-xs text-foreground/60 mt-0.5">
              {order ? `${order.orderNumber}${order.customerName ? ` · ${order.customerName}` : ''} · ` : ''}
              {formatFileSize(upload.fileSize)}
            </p>
            <p className="text-xs text-foreground/60 mt-0.5">{options.join(' · ')}</p>
          </div>
          <button onClick={onClose} className="p-2 -m-1 rounded-xl hover:bg-muted flex-shrink-0" title="Close (Esc)">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 bg-muted relative overflow-auto">
          {state === 'loading' && (
            <div className="absolute inset-0 p-5 space-y-3" role="status" aria-busy="true"><span className="sr-only">Loading preview…</span><Skeleton className="h-5 w-1/2" /><Skeleton className="h-[70%] w-full rounded-xl" /></div>
          )}
          {state === 'error' && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-2">
              <FileWarning className="h-8 w-8 text-foreground/40" />
              <p className="text-sm font-medium">Couldn&apos;t load this file</p>
              <p className="text-xs text-foreground/60">{error}</p>
            </div>
          )}
          {kind === 'pdf' && url && <iframe src={url} title="PDF preview" className="w-full h-full border-0 bg-white" />}
          {kind === 'image' && url && (
            // eslint-disable-next-line @next/next/no-img-element
            <div className="min-h-full flex items-center justify-center p-4"><img src={url} alt={upload.originalName} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow bg-white" /></div>
          )}
          {kind === 'docx' && <div ref={docxRef} className="docx-preview-host p-2 sm:p-4 [&_.docx-wrapper]:!bg-transparent [&_.docx-wrapper]:!p-0" />}
          {kind === 'none' && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-2">
              <FileWarning className="h-8 w-8 text-foreground/40" />
              <p className="text-sm font-medium">No preview for .{ext(upload.originalName)} files</p>
              <p className="text-xs text-foreground/60 max-w-sm">
                Previews work for PDF, Word (.docx) and images. Use Print to open this file in its own app and check it there.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-t">
          <p className="text-[11px] text-foreground/50">
            {upload.deleteAfter ? `This file is deleted automatically in about ${getTimeRemaining(upload.deleteAfter)} at most` : ''}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
            <Button size="sm" onClick={() => api.uploads.open(upload.id).catch((e) => alert(e.message))}>
              <Printer className="h-3.5 w-3.5 mr-1.5" /> Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
