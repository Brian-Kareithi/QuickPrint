'use client';

import { Skeleton } from '@/components/skeleton';
import { ErrorState } from '@/components/error-state';

import { useState, useEffect } from 'react';
import { api, getAppUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Download, Printer, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';

export default function QRCodePage() {
  const [shop, setShop] = useState<any>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    api.shops.mine().then(async (shops) => {
      if (shops.length > 0) {
        const s = await api.shops.byId(shops[0].id);
        setShop(s);
        setQrData(await api.qrcode.get(s.slug));
      }
    }).catch((e) => setError(e.message || 'Could not load your QR code')).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid lg:grid-cols-5 gap-5 max-w-4xl">
      <div className="lg:col-span-3 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <Skeleton className="lg:col-span-2 h-80 rounded-2xl" />
    </div>
  );
  if (error && !shop) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!shop || !qrData) return <p className="text-center py-12 text-sm text-foreground/60">Create your business first.</p>;

  const customerUrl: string = qrData.url || `${getAppUrl()}/shop/${shop.slug}`;
  const canManage = shop.ownerId === user?.id;
  const isLocalhost =/localhost|127\.0\.0\.1/.test(customerUrl);

  const copy = async () => {
    await navigator.clipboard?.writeText(customerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = async () => {
    await navigator.clipboard?.writeText(shop.shopCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const regenerate = async () => {
    if (!window.confirm('Generate a new code? The old code will stop working for customers who have not used it yet.')) return;
    setRegenerating(true);
    try {
      const { shopCode } = await api.shops.regenerateCode(shop.id);
      setShop({ ...shop, shopCode });
    } catch (e: any) {
      setError(e.message || 'Could not generate a new code');
    } finally {
      setRegenerating(false);
    }
  };

  const download = (href: string, name: string) => {
    const a = document.createElement('a');
    a.download = name;
    a.href = href;
    a.click();
  };

  return (
    <div className="grid lg:grid-cols-5 gap-5 max-w-4xl">
      <div className="lg:col-span-3 space-y-4">
        <div>
          <h2 className="text-base font-semibold">Your customer link & QR code</h2>
          <p className="text-xs text-foreground/60">Customers scan the QR code or open the link to upload files directly to {shop.name}.</p>
        </div>

        {isLocalhost && (
          <p className="text-xs text-orange-800 bg-orange-50 border border-orange-200 rounded-xl p-3">
            This link points to <b>localhost</b>, which customers&apos; phones can&apos;t open. Set <code>NEXT_PUBLIC_APP_URL</code> to your
            live website address and redeploy before printing the QR code.
          </p>
        )}

        {shop.shopCode && (
          <div className="bg-card rounded-2xl border shadow-sm p-5 space-y-3">
            <label className="text-xs font-medium text-foreground/60">Your shop code</label>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-bold tracking-[0.3em] text-primary select-all">{shop.shopCode}</span>
              <Button variant="outline" onClick={copyCode}>
                {codeCopied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}{codeCopied ? 'Copied' : 'Copy'}
              </Button>
              {canManage && (
                <Button variant="outline" onClick={regenerate} disabled={regenerating}>
                  <RefreshCw className={`h-4 w-4 mr-1.5 ${regenerating ? 'animate-spin' : ''}`} /> New code
                </Button>
              )}
            </div>
            <p className="text-[11px] text-foreground/50">Give this code to customers. After they sign in, they enter it under &quot;Send files&quot; to send documents to {shop.name}. It also appears on your printed poster.</p>
          </div>
        )}

        <div className="bg-card rounded-2xl border shadow-sm p-5 space-y-3">
          <label className="text-xs font-medium text-foreground/60">Your shop link</label>
          <div className="flex gap-2">
            <input readOnly value={customerUrl} onFocus={(e) => e.target.select()}
              className="flex-1 min-w-0 h-11 sm:h-10 rounded-xl border border-input bg-card px-3 text-sm" />
            <Button variant="outline" onClick={copy}>
              {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}{copied ? 'Copied' : 'Copy'}
            </Button>
            <Button onClick={() => window.open(customerUrl, '_blank')}><ExternalLink className="h-4 w-4 mr-1.5" /> Open</Button>
          </div>
          <p className="text-[11px] text-foreground/50">Put this link on your social media, WhatsApp status or receipts.</p>
        </div>

        <div className="bg-card rounded-2xl border shadow-sm p-5 space-y-3">
          <h3 className="text-sm font-semibold">Print it for your counter</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => window.open(api.qrcode.poster(shop.slug), '_blank')}><Printer className="h-4 w-4 mr-1.5" /> Print poster</Button>
            <Button variant="outline" onClick={() => download(qrData.qrDataUrl, `${shop.slug}-qrcode.png`)}><Download className="h-4 w-4 mr-1.5" /> PNG</Button>
            <Button variant="outline" onClick={() => {
              const url = URL.createObjectURL(new Blob([qrData.qrSvg], { type: 'image/svg+xml' }));
              download(url, `${shop.slug}-qrcode.svg`);
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}><Download className="h-4 w-4 mr-1.5" /> SVG</Button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-card rounded-2xl border shadow-sm p-5 text-center space-y-3 lg:sticky lg:top-20">
          <p className="text-sm font-semibold">{shop.name}</p>
          <div className="mx-auto w-56 h-56 bg-white rounded-xl border p-2.5">
            <img src={qrData.qrDataUrl} alt="QR code" className="w-full h-full" />
          </div>
          <p className="text-xs text-foreground/60">Scan to upload your documents</p>
        </div>
      </div>
    </div>
  );
}
