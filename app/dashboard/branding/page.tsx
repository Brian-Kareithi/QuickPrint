'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, Printer } from 'lucide-react';

const COLORS = [
  '#2563eb', '#1e40af', '#16a34a', '#15803d', '#ca8a04',
  '#a16207', '#dc2626', '#b91c1c', '#7c3aed', '#6d28d9',
];

export default function BrandingPage() {
  const [shop, setShop] = useState<any>(null);
  const [branding, setBranding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.shops.mine().then(async (shops) => {
      if (shops.length > 0) {
        const s = await api.shops.byId(shops[0].id);
        setShop(s);
        setBranding(s.branding || { primaryColor: '#2563eb', secondaryColor: '#1e40af', backgroundColor: '#ffffff', buttonStyle: 'rounded', backgroundStyle: 'solid' });
      }
      setLoading(false);
    });
  }, []);

  const updateColor = (key: string, value: string) => setBranding({ ...branding, [key]: value });

  const handleSave = async () => {
    if (!shop) return;
    setSaving(true);
    await api.shops.updateBranding(shop.id, branding);
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Branding</h2>
        <div className="bg-card rounded-xl border shadow-sm p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider block mb-3">Primary color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={branding?.primaryColor || '#000000'}
                onChange={(e) => updateColor('primaryColor', e.target.value)}
                className="h-10 w-14 rounded-lg border cursor-pointer" />
              <Input value={branding?.primaryColor || ''}
                onChange={(e) => updateColor('primaryColor', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider block mb-3">Secondary color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={branding?.secondaryColor || '#000000'}
                onChange={(e) => updateColor('secondaryColor', e.target.value)}
                className="h-10 w-14 rounded-lg border cursor-pointer" />
              <Input value={branding?.secondaryColor || ''}
                onChange={(e) => updateColor('secondaryColor', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider block mb-3">Background color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={branding?.backgroundColor || '#ffffff'}
                onChange={(e) => updateColor('backgroundColor', e.target.value)}
                className="h-10 w-14 rounded-lg border cursor-pointer" />
              <Input value={branding?.backgroundColor || ''}
                onChange={(e) => updateColor('backgroundColor', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider block mb-3">Preset colors</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} onClick={() => updateColor('primaryColor', c)}
                  className="h-8 w-8 rounded-lg border-2 border-transparent hover:border-foreground/30 transition-colors"
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider block mb-3">Button style</label>
            <select value={branding?.buttonStyle || 'rounded'}
              onChange={(e) => setBranding({ ...branding, buttonStyle: e.target.value })}
              className="block w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
              <option value="rounded">Rounded</option>
              <option value="square">Square</option>
              <option value="pill">Pill</option>
            </select>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1.5" /> {saving ? 'Saving...' : 'Save branding'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Preview</h2>
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden" style={{ backgroundColor: branding?.backgroundColor || '#ffffff' }}>
          <div className="p-6">
            <div className="rounded-xl border bg-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: branding?.primaryColor }}>
                  <Printer className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: branding?.primaryColor }}>{shop?.name || 'Shop Name'}</h3>
                  <p className="text-xs text-foreground/60">Upload your documents for printing</p>
                </div>
              </div>
              <div className="h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-xs text-foreground/40 mb-3">
                Drop files here
              </div>
              <button className="w-full py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: branding?.primaryColor,
                  borderRadius: branding?.buttonStyle === 'pill' ? '9999px' : branding?.buttonStyle === 'square' ? '0' : '0.5rem',
                }}>
                Upload documents
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
