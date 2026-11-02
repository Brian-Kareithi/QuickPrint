import type { ReactNode } from 'react';
import { Logo } from '@/components/logo';
import { Upload, ListChecks, Wallet } from 'lucide-react';

const POINTS = [
  { icon: Upload, text: 'Customers upload files from their phone' },
  { icon: ListChecks, text: 'A live print queue for your counter' },
  { icon: Wallet, text: 'M-Pesa, Airtel and bank payments tracked' },
];

/** Split-screen frame shared by sign in and sign up: brand panel on desktop, plain card on mobile. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[1.05fr_1fr] p-3 gap-3">
      <aside className="hidden lg:flex flex-col justify-between rounded-3xl bg-panel text-white p-10 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-[#80ced7]/20 blur-3xl" />
        <Logo tone="light" />
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight leading-tight max-w-sm">
            Print shop orders, without the paper trail.
          </h2>
          <ul className="mt-8 space-y-4">
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

      <main className="relative flex-1 flex flex-col items-center justify-center px-1 py-6 overflow-hidden rounded-3xl lg:overflow-visible">
        {/* Soft glow behind the container so it reads as floating (phones and tablets) */}
        <div aria-hidden="true" className="lg:hidden pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div aria-hidden="true" className="lg:hidden pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#80ced7]/20 blur-3xl" />

        {/* The whole sign-in section - logo, heading and form - lives in one floating container */}
        <section className="page-enter relative w-full max-w-sm rounded-[2rem] border bg-card/95 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,50,73,0.25)] p-6 sm:p-8">
          <div className="lg:hidden flex justify-center mb-6"><Logo /></div>
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-foreground/60 mt-1">{subtitle}</p>
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}
