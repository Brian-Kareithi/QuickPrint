import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getTimeRemaining(deleteAfter: string): string {
  const remaining = new Date(deleteAfter).getTime() - Date.now();
  if (remaining <= 0) return 'Deleting soon';
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    CONFIRMED: 'bg-[#9ad1d4]/50 text-[#003249]',
    PROCESSING: 'bg-[#9ad1d4]/50 text-[#003249]',
    PRINTING: 'bg-primary/15 text-primary',
    READY_FOR_PICKUP: 'bg-emerald-100 text-emerald-800',
    COMPLETED: 'bg-stone-200 text-stone-700',
    COLLECTED: 'bg-stone-200 text-stone-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-stone-200 text-stone-700';
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PAID: 'bg-emerald-100 text-emerald-800',
    PARTIALLY_PAID: 'bg-amber-100 text-amber-800',
    PENDING: 'bg-stone-200 text-stone-700',
    REFUNDED: 'bg-red-100 text-red-700',
    FAILED: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-stone-200 text-stone-700';
}
