import { cn } from '@/lib/utils';

/** QuickPrint mark: a sheet leaving a printer. Uses the shop/theme primary colour. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-8 w-8 flex-shrink-0', className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--primary)" />
      <path d="M10.5 5.5h8l3.5 3.5v7h-11.5z" fill="#fff" />
      <path d="M18.5 5.5V9H22z" fill="#fff" opacity="0.55" />
      <rect x="6" y="14" width="20" height="9" rx="3" fill="#000" opacity="0.38" />
      <circle cx="22" cy="18" r="1.3" fill="#fff" opacity="0.9" />
      <rect x="10.5" y="20" width="11" height="7" rx="1.5" fill="#fff" />
      <path d="M13 23h6M13 25h4" stroke="var(--primary)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const mark = size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const text = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg';
  return (
    <span className={cn('group inline-flex items-center gap-2.5', className)}>
      <LogoMark className={cn(mark, 'transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105')} />
      <span className={cn('font-semibold tracking-tight', text)}>
        Quick<span className="text-primary">Print</span>
      </span>
    </span>
  );
}
