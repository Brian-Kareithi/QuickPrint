'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ArrowRight, QrCode, ListChecks, Wallet, BarChart3, ShieldCheck, Palette, FileText, Check } from 'lucide-react';

const STEPS = [
  { n: '01', title: 'Scan', desc: 'Customers scan the QR code on your counter. No app, no account, no waiting for the Wi-Fi password.' },
  { n: '02', title: 'Upload', desc: 'They pick their file, choose colour, size and copies, and see the exact price before they pay.' },
  { n: '03', title: 'Collect', desc: 'The job lands in your live queue. Print it, mark it ready, and they are notified to pick it up.' },
];

const FEATURES = [
  { icon: QrCode, title: 'Your own QR portal', desc: 'A branded upload page for your shop, with a printable poster for the counter.' },
  { icon: ListChecks, title: 'A queue that stays calm', desc: 'Orders appear the moment they are placed, oldest first, with honest time estimates.' },
  { icon: Wallet, title: 'Made for local payments', desc: 'M-Pesa, Airtel Money and bank details, with one tap to confirm a payment.' },
  { icon: BarChart3, title: 'Know your numbers', desc: 'Revenue, pages printed and your busiest hours, without a spreadsheet.' },
  { icon: ShieldCheck, title: 'Files do not linger', desc: 'Every document is erased an hour after the order is ready.' },
  { icon: Palette, title: 'Looks like your shop', desc: 'Your name, colours and button style on everything customers see.' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="light min-h-screen flex flex-col pb-12 bg-[#f7f5f0] text-[#003249] selection:bg-[#80ced7]">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#f7f5f0]/80">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-1 sm:gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard" className="text-sm font-medium px-5 py-2.5 rounded-full bg-[#003249] text-white hover:bg-[#003249]/90 transition-colors">
                Open dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium px-4 py-2.5 rounded-full hover:bg-[#003249]/5 transition-colors">Sign in</Link>
                <Link href="/auth/register" className="text-sm font-medium px-5 py-2.5 rounded-full bg-[#003249] text-white hover:bg-[#003249]/90 transition-colors">
                  Start your shop
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-8 min-h-[calc(100vh-4rem)] grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-8 items-center content-center">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#007ea7] mb-5">Print shop software</p>
            <h1 className="font-display text-[clamp(2.6rem,min(9vw,11vh),5.5rem)] leading-[1.02] tracking-tight">
              Your print shop,<br />
              run from one <em className="text-[#007ea7]">QR code.</em>
            </h1>
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-[#003249]/65 max-w-md leading-relaxed">
              Customers scan, upload and pay from their phone. You get a clean queue, clear prices and files that delete themselves.
            </p>
            <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row gap-3">
              <Link href="/auth/register" className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#003249] text-white text-sm font-medium hover:bg-[#003249]/90 transition-all">
                Start your shop
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/auth/login" className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-[#003249]/20 text-sm font-medium hover:bg-[#003249]/5 transition-colors">
                Sign in
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm h-[20rem] sm:h-[23rem] lg:h-[min(25rem,52vh)] lg:min-h-[21rem]" aria-hidden="true">
            <div className="absolute inset-x-6 top-6 h-full rounded-3xl bg-[#9ad1d4]/40 rotate-[5deg]" />
            <div className="absolute inset-x-3 top-3 h-full rounded-3xl bg-white/70 border border-[#003249]/10 -rotate-[3deg]" />
            <div className="absolute inset-0 rounded-3xl bg-white border border-[#003249]/10 shadow-[0_24px_60px_-20px_rgba(0,50,73,0.35)] p-6 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wide text-[#003249]/50">QP-4F2K9</span>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#9ad1d4]/50">Printing</span>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <span className="h-11 w-11 rounded-xl bg-[#003249]/5 flex items-center justify-center"><FileText className="h-5 w-5 text-[#007ea7]" /></span>
                <div>
                  <p className="text-sm font-semibold">Project report.pdf</p>
                  <p className="text-xs text-[#003249]/55">24 pages · B&amp;W · A4 · 2 copies</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {['Uploaded', 'Paid with M-Pesa', 'Printing now'].map((label, i) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <span className={`h-5 w-5 rounded-full flex items-center justify-center ${i < 2 ? 'bg-[#007ea7] text-white' : 'border-2 border-[#007ea7] '}`}>
                      {i < 2 && <Check className="h-3 w-3" />}
                    </span>
                    <span className={i === 2 ? 'font-medium' : 'text-[#003249]/60'}>{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-5 border-t border-[#003249]/10 flex items-end justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#003249]/45">Ready in about</p>
                  <p className="font-display text-4xl leading-none mt-1">12 min</p>
                </div>
                <p className="text-sm font-semibold">KES 480</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#003249]/10">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <h2 className="font-display text-4xl sm:text-5xl tracking-tight max-w-lg">Three steps, no paperwork.</h2>
            <div className="mt-12 grid md:grid-cols-3 gap-10 md:gap-8">
              {STEPS.map((s) => (
                <div key={s.n} className="md:border-l md:border-[#003249]/10 md:pl-8 md:first:border-0 md:first:pl-0">
                  <span className="font-display text-5xl text-[#007ea7]">{s.n}</span>
                  <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-[#003249]/65 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#007ea7] mb-4">Built for African print shops</p>
            <h2 className="font-display text-4xl sm:text-5xl tracking-tight">Everything the counter needs, nothing it does not.</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4">
                <span className="mt-0.5 h-10 w-10 flex-shrink-0 rounded-full bg-[#9ad1d4]/45 flex items-center justify-center">
                  <f.icon className="h-[18px] w-[18px] text-[#003249]" />
                </span>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-[#003249]/65 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#003249] text-white px-7 py-14 sm:px-14 sm:py-16 text-center sm:text-left sm:flex items-center justify-between gap-8">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#007ea7]/40 blur-3xl" />
            <h2 className="relative font-display text-4xl sm:text-5xl tracking-tight max-w-md leading-tight">Set up your shop in a few minutes.</h2>
            <Link href="/auth/register" className="relative mt-8 sm:mt-0 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#003249] text-sm font-semibold hover:bg-[#9ad1d4] transition-colors flex-shrink-0">
              Start your shop <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
