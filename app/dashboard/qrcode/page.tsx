'use client';

import { useState, useEffect } from 'react';
import { api, getAppUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Printer } from 'lucide-react';

export default function QRCodePage() {
  const [shop, setShop] = useState<any>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.shops.mine().then(async (shops) => {
      if (shops.length > 0) {
        const s = await api.shops.byId(shops[0].id);
        setShop(s);
        const qr = await api.qrcode.get(s.slug);
        setQrData(qr);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!shop || !qrData) return <p className="text-center py-12 text-sm text-foreground/60">No shop found</p>;

  const customerUrl = qrData.url || `${getAppUrl()}/shop/${shop.slug}`;
  const isLocalhost = /localhost|127.0.0.1/.test(customerUrl);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-lg font-semibold">QR code</h2>
      <div className="bg-card rounded-xl border shadow-sm p-6 text-center space-y-5">
        <div>
          <p className="text-sm font-medium mb-1">{shop.name}</p>
          <p className="text-xs text-foreground/60 break-all">{customerUrl}</p>
        </div>
        {isLocalhost && (
          <p className="text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg p-3 text-left">
            This QR code points to <b>localhost</b>, which customers&apos; phones cannot open. Set <code>NEXT_PUBLIC_APP_URL</code> to your
            public or network address (e.g. https://quickprint.example.com) and restart the app before printing it.
          </p>
        )}
        <div className="mx-auto w-64 h-64 bg-white rounded-xl border p-3 shadow-sm">
          <img src={qrData.qrDataUrl} alt="QR Code" className="w-full h-full" />
        </div>
        <div className="flex justify-center gap-3">
          <Button size="sm" onClick={() => {
            const link = document.createElement('a');
            link.download = `${shop.slug}-qrcode.png`;
            link.href = qrData.qrDataUrl;
            link.click();
          }}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> PNG
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const svgBlob = new Blob([qrData.qrSvg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            const link = document.createElement('a');
            link.download = `${shop.slug}-qrcode.svg`;
            link.href = url;
            link.click();
          }}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> SVG
          </Button>
        </div>
        <Button variant="secondary" onClick={() => window.open(api.qrcode.poster(shop.slug), '_blank')}>
          <Printer className="h-3.5 w-3.5 mr-1.5" /> Print poster
        </Button>
      </div>
    </div>
  );
}
