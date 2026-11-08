import type { ReactNode } from 'react';
import { Logo } from '@/components/logo';
import { Upload, ListChecks, Wallet } from 'lucide-react';

const POINTS = [
  { icon: Upload, text: 'Customers upload files from their phone' },
  { icon: ListChecks, text: 'A live print queue for your counter' },
  { icon: Wallet, text: 'M-Pesa, Airtel and bank payments tracked' },
];

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="h-[calc(100dvh-2.75rem)] overflow-hidden flex flex-col lg:grid lg:grid-cols-[1.05fr_1fr] p-3 gap-3">
      <aside className="hidden lg:flex flex-col justify-between min-h-0 rounded-3xl bg-panel text-white p-[clamp(1.5rem,5dvh,2.5rem)] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-[#80ced7]/20 blur-3xl" />
        <Logo tone="light" />
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight leading-tight max-w-sm">
            Print shop orders, without the paper trail.
          </h2>
          <ul className="mt-[clamp(1rem,4dvh,2rem)] space-y-[clamp(0.5rem,2dvh,1rem)]">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-sm text-white/80">
                <span className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <p.icon className="h-4 w-4 text-[#80ced7]" />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/40">&copy; {new Date().getFullYear()} QuickPrint</p>
      </aside>

      <main className="relative flex-1 min-h-0 flex flex-col items-center justify-center px-1 overflow-hidden rounded-3xl">
        <div aria-hidden="true" className="lg:hidden pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div aria-hidden="true" className="lg:hidden pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#80ced7]/20 blur-3xl" />

        <section className="page-enter relative w-full max-w-sm auth-card rounded-[2rem] border bg-card/95 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,50,73,0.25)]">
          <div className="auth-logo lg:hidden flex justify-center"><Logo /></div>
          <div className="auth-head text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="auth-sub text-sm text-foreground/60 mt-1">{subtitle}</p>
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}
