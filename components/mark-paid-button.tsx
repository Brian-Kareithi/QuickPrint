'use client';

import { useState } from 'react';
import { CircleDollarSign, Check } from 'lucide-react';
import { api } from '@/lib/api';

export function MarkPaidButton({ order, onChange }: { order: any; onChange?: (o: any) => void }) {
  const [busy, setBusy] = useState(false);
  const paid = !!order.isPaid;

  return (
    <button
      disabled={busy}
      title={paid ? 'Click to mark as unpaid' : 'Mark as paid'}
      onClick={async () => {
        setBusy(true);
        try { onChange?.(await api.orders.setPayment(order.id, !paid)); }
        catch (err: any) { alert(err.message || 'Could not update payment'); }
        finally { setBusy(false); }
      }}
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-colors disabled:opacity-50 ${
        paid ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
      }`}
    >
      {paid ? <Check className="h-3 w-3" /> : <CircleDollarSign className="h-3 w-3" />}
      {paid ? 'Paid' : 'Mark paid'}
    </button>
  );
}
