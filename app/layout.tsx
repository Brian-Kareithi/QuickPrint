import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { SiteFooter } from '@/components/site-footer';
import { Toaster } from '@/components/toaster';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const display = Instrument_Serif({ variable: '--font-instrument', subsets: ['latin'], weight: '400', style: ['normal', 'italic'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'QuickPrint', template: '%s · QuickPrint' },
  description: 'Multi-tenant print shop management platform for cyber cafés, print shops, universities, and libraries.',
};

export const viewport: Viewport = { themeColor: '#003249' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${display.variable} antialiased`}>
        <AuthProvider>
          {children}
          <SiteFooter />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
