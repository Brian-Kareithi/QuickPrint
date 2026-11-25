import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export const metadata: Metadata = {
  title: 'Terms & Privacy',
  description: 'The terms for using QuickPrint and how we collect, use and delete your information.',
};

const LAST_UPDATED = '25 November 2026';
const CONTACT_URL = 'https://kareithi.vercel.app';

const sections: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: 'about',
    title: '1. About QuickPrint',
    body: (
      <>
        <p>QuickPrint is a platform that lets you send documents to a print shop or cyber café (&quot;the shop&quot;) from your phone or computer, using the shop&apos;s QR code, shop code or link, through our website and Android app (together, &quot;the service&quot;).</p>
        <p>Each shop is an independent business. The shop, not QuickPrint, prints your documents, sets its prices, takes your payment and is responsible for the quality of the work. By using the service you agree to these terms and to the handling of your information described below. If you do not agree, please do not use the service.</p>
      </>
    ),
  },
  {
    id: 'use',
    title: '2. Using the service',
    body: (
      <>
        <p>You must only upload documents you have the right to print. You must not use the service to send anything illegal, documents that infringe someone else&apos;s copyright, malware, or content that is abusive, hateful or exploits children.</p>
        <p>Be respectful in chats with shops. Shops and QuickPrint may refuse orders, close chats or block access where these terms are broken.</p>
        <p>You do not need an account to send files or chat. If you create one, keep your password private; you are responsible for activity on your account.</p>
      </>
    ),
  },
  {
    id: 'collect',
    title: '3. Information we collect',
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li><strong>Documents you upload</strong>, with their file name, type and size.</li>
        <li><strong>Order details</strong>: print options (pages, copies, colour, binding and so on), price, order number, chosen payment method, pickup time and payment status.</li>
        <li><strong>Contact details you choose to give</strong>: name, email address and phone number. These are optional for guest orders.</li>
        <li><strong>Chat messages</strong> between you and a shop, the nickname we give you (for example &quot;Cute Pineapple&quot;), and any order number you link to the chat.</li>
        <li><strong>Account details</strong> if you register: name, email, phone and a securely hashed password (we never store your password itself).</li>
        <li><strong>Technical information</strong>: your IP address, used briefly in memory to prevent abuse (for example limiting repeated shop-code attempts), and basic server logs.</li>
        <li><strong>On your device</strong>: the website and app save a few items locally, such as your chat key, the last shop you used and your theme preference. You can clear these by clearing the app&apos;s storage or your browser data.</li>
        <li><strong>Camera (Android app)</strong>: the QR scanner uses Google&apos;s code scanner to read a shop&apos;s QR code. We do not take, store or upload photos.</li>
      </ul>
    ),
  },
  {
    id: 'purpose',
    title: '4. How we use your information',
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>To deliver your documents and order to the shop you chose, and to show you your order status.</li>
        <li>To let you and the shop chat about your order, for example to cancel it or replace a wrong file.</li>
        <li>To calculate prices and help the shop keep sales records.</li>
        <li>To keep the service secure, prevent abuse and fix problems.</li>
      </ul>
    ),
  },
  {
    id: 'sharing',
    title: '5. Who can see your information',
    body: (
      <>
        <p><strong>The shop you send to</strong>, meaning its owner and cashiers, can see your documents, order details, the contact details you gave and your chat. Other shops cannot.</p>
        <p><strong>QuickPrint administrators</strong> may access information only where needed to run, support or secure the service.</p>
        <p><strong>Service providers</strong> that host our servers and database process data on our behalf. If you pay by mobile money or card, that payment provider handles your payment details under its own terms.</p>
        <p>We do <strong>not</strong> sell your information or use your documents for advertising.</p>
      </>
    ),
  },
  {
    id: 'retention',
    title: '6. How long we keep it',
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li><strong>Uploaded files you don&apos;t order</strong> are deleted automatically after a short retention period (about an hour).</li>
        <li><strong>Files in an order</strong> are kept while the shop works on it (up to 24 hours) and are permanently deleted shortly (about an hour) after the order is ready, collected or cancelled. When a file is deleted, its name is also removed from the order.</li>
        <li><strong>Chats</strong> are permanently deleted after 30 days with no new messages.</li>
        <li><strong>Order records</strong> (order number, totals, payment status and the contact details given) are kept for the shop&apos;s accounting, but no longer contain your documents.</li>
        <li><strong>Notifications</strong> are deleted after 30 days. <strong>Accounts</strong> are kept until you ask us to delete them.</li>
      </ul>
    ),
  },
  {
    id: 'chat',
    title: '7. Chat with shops',
    body: (
      <>
        <p>When you start a chat, we give you a random fruity nickname so the shop can tell customers apart without needing your real name. A private chat key is saved on your device so you can come back to the conversation; anyone with access to your device or browser could read that chat, so clear it if you share a device.</p>
        <p>Please don&apos;t send passwords, ID numbers, PINs or card numbers in chat. Shops will never need your M-Pesa PIN.</p>
      </>
    ),
  },
  {
    id: 'rights',
    title: '8. Your rights',
    body: (
      <>
        <p>Under the Kenya Data Protection Act, 2019 you have the right to be told how your data is used, to access it, to have it corrected or deleted, and to object to its use. To make a request, contact the shop you used or contact us (below). You can also complain to the Office of the Data Protection Commissioner (ODPC).</p>
      </>
    ),
  },
  {
    id: 'security',
    title: '9. Security',
    body: (
      <p>Data is sent over encrypted connections (HTTPS). Documents can only be opened by the shop they were sent to, are never cached by browsers, and are deleted on the schedule above. No system is perfectly secure, so we cannot guarantee absolute security, but we work to protect your information.</p>
    ),
  },
  {
    id: 'payments',
    title: '10. Payments and liability',
    body: (
      <>
        <p>You pay the shop directly using the methods it accepts. Prices shown are calculated from the shop&apos;s own pricing. Refunds and disputes about printing are between you and the shop.</p>
        <p>The service is provided &quot;as is&quot;. To the extent the law allows, QuickPrint is not liable for losses caused by a shop, by documents you uploaded, or by interruptions to the service. Nothing in these terms limits rights you have under Kenyan consumer law.</p>
      </>
    ),
  },
  {
    id: 'changes',
    title: '11. Changes and contact',
    body: (
      <>
        <p>We may update these terms as the service changes. We will change the date at the top, and continued use after an update means you accept it.</p>
        <p>Questions or data requests: contact the shop you used, or reach the QuickPrint team via <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline">kareithi.vercel.app</a>.</p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-full overflow-y-auto pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <Link href="/"><Logo size="sm" /></Link>
          <Link href="/" className="text-sm text-primary hover:underline">Back to QuickPrint</Link>
        </div>

        <header className="rounded-3xl bg-panel text-white p-6 sm:p-8 relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-16 h-60 w-60 rounded-full bg-[#007ea7]/50 blur-3xl" />
          <p className="relative text-xs font-medium tracking-[0.18em] uppercase text-[#9ad1d4]">Legal</p>
          <h1 className="relative font-display text-4xl sm:text-5xl mt-2 leading-tight">Terms &amp; Privacy</h1>
          <p className="relative text-sm text-white/70 mt-3 max-w-xl">
            In short: your files go only to the shop you choose, are deleted automatically soon after your order is done, and we never sell your data.
          </p>
          <p className="relative text-xs text-white/50 mt-4">Last updated {LAST_UPDATED}</p>
        </header>

        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Sections">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="text-xs rounded-full border bg-card px-3 py-1.5 text-foreground/70 hover:text-primary hover:border-primary">
              {s.title.replace(/^\d+\.\s*/, '')}
            </a>
          ))}
        </nav>

        <div className="mt-6 space-y-4">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} style={{ '--i': i } as React.CSSProperties} className="anim-fade-up scroll-mt-6 bg-card rounded-3xl border p-5 sm:p-6">
              <h2 className="text-lg font-semibold mb-3">{s.title}</h2>
              <div className="text-sm leading-relaxed text-foreground/80 space-y-3">{s.body}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
