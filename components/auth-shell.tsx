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

      <main className="relative flex-1 flex flex-col items-center justify-center px-1 py-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-8"><Logo /></div>
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-foreground/60 mt-1">{subtitle}</p>
          </div>
          <div className="page-enter bg-card rounded-3xl shadow-[0_8px_30px_rgba(0,50,73,0.08)] p-6 sm:p-7">{children}</div>
        </div>
      </main>
    </div>
  );
}
