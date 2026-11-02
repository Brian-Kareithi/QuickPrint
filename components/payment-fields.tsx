'use client';

import { Input } from '@/components/ui/input';

export interface PaymentValues {
  acceptCash: boolean;
  mpesaMethod: string;
  mpesaNumber: string;
  mpesaAccountRef: string;
  mpesaAccountName: string;
  airtelNumber: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  paymentNotes: string;
}

export const emptyPayment: PaymentValues = {
  acceptCash: true, mpesaMethod: 'TILL', mpesaNumber: '', mpesaAccountRef: '', mpesaAccountName: '',
  airtelNumber: '', bankName: '', bankAccountName: '', bankAccountNumber: '', paymentNotes: '',
};

/** Build form values from a saved shop. */
export function paymentFromShop(shop: Record<string, any>): PaymentValues {
  return {
    acceptCash: shop.acceptCash !== false,
    mpesaMethod: shop.mpesaMethod || 'TILL',
    mpesaNumber: shop.mpesaNumber || '',
    mpesaAccountRef: shop.mpesaAccountRef || '',
    mpesaAccountName: shop.mpesaAccountName || '',
    airtelNumber: shop.airtelNumber || '',
    bankName: shop.bankName || '',
    bankAccountName: shop.bankAccountName || '',
    bankAccountNumber: shop.bankAccountNumber || '',
    paymentNotes: shop.paymentNotes || '',
  };
}

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <div>
    <label className="text-xs font-medium text-foreground/60 block mb-1">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-foreground/45 mt-1">{hint}</p>}
  </div>
);

export function PaymentFields({ value, onChange }: { value: PaymentValues; onChange: (v: PaymentValues) => void }) {
  const set = (k: keyof PaymentValues, v: string | boolean) => onChange({ ...value, [k]: v });
  const selectClass = 'block w-full h-10 rounded-lg border border-input bg-background px-3 text-sm';

  return (
    <div className="space-y-5">
      <label className="flex items-center gap-2.5 text-sm cursor-pointer">
        <input type="checkbox" checked={value.acceptCash} onChange={(e) => set('acceptCash', e.target.checked)} className="h-4 w-4 accent-[#007ea7]" />
        Accept cash when customers collect
      </label>

      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-1">M-Pesa</legend>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="How customers pay you">
            <select value={value.mpesaMethod} onChange={(e) => set('mpesaMethod', e.target.value)} className={selectClass}>
              <option value="TILL">Buy Goods (Till number)</option>
              <option value="PAYBILL">Paybill</option>
              <option value="SEND_MONEY">Send money (phone number)</option>
            </select>
          </Field>
          <Field label={value.mpesaMethod === 'TILL' ? 'Till number' : value.mpesaMethod === 'PAYBILL' ? 'Paybill number' : 'M-Pesa phone number'}>
            <Input value={value.mpesaNumber} onChange={(e) => set('mpesaNumber', e.target.value)} placeholder={value.mpesaMethod === 'SEND_MONEY' ? '07XX XXX XXX' : '123456'} />
          </Field>
          {value.mpesaMethod === 'PAYBILL' && (
            <Field label="Account number" hint="What customers type as the account">
              <Input value={value.mpesaAccountRef} onChange={(e) => set('mpesaAccountRef', e.target.value)} />
            </Field>
          )}
          <Field label="Registered name" hint="The name customers see when paying">
            <Input value={value.mpesaAccountName} onChange={(e) => set('mpesaAccountName', e.target.value)} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-1">Airtel Money</legend>
        <Field label="Airtel Money number">
          <Input value={value.airtelNumber} onChange={(e) => set('airtelNumber', e.target.value)} placeholder="073X XXX XXX" />
        </Field>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-1">Bank (optional)</legend>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Bank"><Input value={value.bankName} onChange={(e) => set('bankName', e.target.value)} /></Field>
          <Field label="Account name"><Input value={value.bankAccountName} onChange={(e) => set('bankAccountName', e.target.value)} /></Field>
          <Field label="Account number"><Input value={value.bankAccountNumber} onChange={(e) => set('bankAccountNumber', e.target.value)} /></Field>
        </div>
      </fieldset>

      <Field label="Note to customers (optional)" hint="Shown with the payment instructions after an order">
        <textarea value={value.paymentNotes} onChange={(e) => set('paymentNotes', e.target.value)} rows={2}
          className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      </Field>
    </div>
  );
}
