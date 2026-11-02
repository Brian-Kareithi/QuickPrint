import { cn } from '@/lib/utils';

/** QuickPrint mark: a sheet leaving a printer. Uses the shop/theme primary colour. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-8 w-8 flex-shrink-0', className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#003249" />
      <path d="M10.5 5.5h8l3.5 3.5v7h-11.5z" fill="#fff" />
      <path d="M18.5 5.5V9H22z" fill="#80ced7" />
      <rect x="6" y="14" width="20" height="9" rx="3" fill="#007ea7" />
      <circle cx="22" cy="18" r="1.3" fill="#ccdbdc" />
      <rect x="10.5" y="20" width="11" height="7" rx="1.5" fill="#fff" />
      <path d="M13 23h6M13 25h4" stroke="#003249" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, size = 'md', tone = 'dark' }: { className?: string; size?: 'sm' | 'md' | 'lg'; tone?: 'dark' | 'light' }) {
  const mark = size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const text = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg';
  return (
    <span className={cn('group inline-flex items-center gap-2.5', className)}>
      <LogoMark className={cn(mark, 'transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105')} />
      <span className={cn('font-semibold tracking-tight', text, tone === 'light' && 'text-white')}>
        Quick<span className={tone === 'light' ? 'text-[#80ced7]' : 'text-primary'}>Print</span>
      </span>
    </span>
  );
}
