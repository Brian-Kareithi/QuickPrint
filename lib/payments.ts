import type { Shop } from '@/types';

export interface PaymentOption {
  value: 'CASH_ON_PICKUP' | 'MPESA' | 'AIRTEL_MONEY';
  label: string;
}

/** Payment methods this shop has actually set up. */
export function paymentOptions(shop: Pick<Shop, 'acceptCash' | 'mpesaNumber' | 'airtelNumber'>): PaymentOption[] {
  const opts: PaymentOption[] = [];
  if (shop.acceptCash !== false) opts.push({ value: 'CASH_ON_PICKUP', label: 'Cash on pickup' });
  if (shop.mpesaNumber) opts.push({ value: 'MPESA', label: 'M-Pesa' });
  if (shop.airtelNumber) opts.push({ value: 'AIRTEL_MONEY', label: 'Airtel Money' });
  if (opts.length === 0) opts.push({ value: 'CASH_ON_PICKUP', label: 'Pay at the shop' });
  return opts;
}

/** Human-readable "how to pay" lines for the chosen method. */
export function paymentInstructions(shop: Shop, method: string, amount?: number): string[] {
  const lines: string[] = [];
  if (method === 'MPESA' && shop.mpesaNumber) {
    const how: Record<string, string> = {
      TILL: `Lipa na M-Pesa > Buy Goods > Till number ${shop.mpesaNumber}`,
      PAYBILL: `Lipa na M-Pesa > Paybill > Business no. ${shop.mpesaNumber}${shop.mpesaAccountRef ? `, Account no. ${shop.mpesaAccountRef}` : ''}`,
      SEND_MONEY: `Send money to ${shop.mpesaNumber}`,
    };
    lines.push(how[shop.mpesaMethod || 'SEND_MONEY'] || `Pay M-Pesa to ${shop.mpesaNumber}`);
    if (shop.mpesaAccountName) lines.push(`Name shown: ${shop.mpesaAccountName}`);
  } else if (method === 'AIRTEL_MONEY' && shop.airtelNumber) {
    lines.push(`Send Airtel Money to ${shop.airtelNumber}`);
  } else if (method === 'CASH_ON_PICKUP') {
    lines.push('Pay in cash when you collect your prints.');
  }
  if (amount !== undefined && method !== 'CASH_ON_PICKUP') lines.push(`Amount: ${amount.toFixed(2)} ${shop.currency || 'KES'}`);
  if (shop.bankAccountNumber) {
    lines.push(`Bank: ${[shop.bankName, shop.bankAccountName, shop.bankAccountNumber].filter(Boolean).join(' · ')}`);
  }
  if (shop.paymentNotes) lines.push(shop.paymentNotes);
  return lines;
}
