'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { QrCode, Upload, Shield, TrendingUp, Building2 } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Dashboard</Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-4 py-2">Sign in</Link>
                <Link href="/auth/register" className="text-sm font-medium bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm">Start your shop</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 md:py-36">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border text-sm text-muted-foreground mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Multi-tenant print shop platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              Smart print management
              <span className="block text-primary">for modern shops</span>
            </h1>
            <p className="text-base sm:text-lg text-foreground/60 max-w-xl mx-auto mb-10 leading-relaxed">
              The all-in-one platform for print shops, cyber cafés, and business centers.
              Generate QR codes, accept uploads, manage queues, and process payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/register" className="bg-primary text-white px-7 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md transition-all shadow-sm">
                Start your shop
              </Link>
              <Link href="/auth/login" className="border border-border bg-background px-7 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/40 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: QrCode, title: 'QR Code Upload', desc: 'Customers scan a QR code to instantly upload documents from their phone. No app required.' },
                { icon: Upload, title: 'Smart Queue', desc: 'Real-time print queue with live updates. Staff sees new orders the moment they come in.' },
                { icon: Shield, title: 'Privacy First', desc: 'Documents are automatically deleted one hour after upload, so customer files never linger.' },
              ].map((f, i) => (
                <div key={i} className="bg-card rounded-2xl p-7 border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Built for African print shops</h2>
              <p className="text-foreground/60 max-w-lg mx-auto">Everything you need to run a modern print business</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Building2, title: 'Multi-tenant', desc: 'Each shop gets its own branded portal with isolated data' },
                { icon: TrendingUp, title: 'Analytics', desc: 'Track revenue, pages printed, and peak hours' },
                { icon: Upload, title: 'M-Pesa ready', desc: 'Built-in mobile money and card payment support' },
                { icon: Shield, title: 'Auto-deletion', desc: 'Every uploaded document is deleted after one hour' },
              ].map((f, i) => (
                <div key={i} className="bg-card rounded-2xl p-6 border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <f.icon className="h-6 w-6 text-primary mb-3" />
                  <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                  <p className="text-xs text-foreground/60 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-sm text-foreground/50">
          &copy; 2026 QuickPrint. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
