'use client';

import { FormSkeleton } from '@/components/skeleton';
import { ErrorState } from '@/components/error-state';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';

export default function PricingPage() {
  const [shop, setShop] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.shops.mine().then(async (shops) => {
      if (shops.length > 0) {
        const s = await api.shops.byId(shops[0].id);
        setShop(s);
        setPricing(s.pricing);
      }
    }).catch((e) => setError(e.message || 'Could not load your pricing')).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!shop) return;
    setSaving(true);
    try {
      await api.shops.updatePricing(shop.id, pricing);
    } catch (e: any) {
      alert(e.message || 'Could not save your pricing');
    } finally {
      setSaving(false);
    }
  };

  const updatePrice = (key: string, value: string) => {
    setPricing({ ...pricing, [key]: parseFloat(value) || 0 });
  };

  if (loading) return <FormSkeleton fields={6} />;
  if (error || !pricing) {
    return error
      ? <ErrorState message={error} onRetry={() => window.location.reload()} />
      : <p className="text-center py-12 text-sm text-foreground/60">Create your business first.</p>;
  }

  const sections = [
    { title: 'Printing', keys: ['bwPagePrice', 'colorPagePrice'] },
    { title: 'Paper sizes', keys: ['a4Price', 'a3Price', 'letterPrice', 'legalPrice'] },
    { title: 'Binding', keys: ['spiralBindPrice', 'combBindPrice', 'tapeBindPrice', 'hardcoverPrice'] },
    { title: 'Finishing', keys: ['laminationPrice', 'staplingPrice', 'foldingPrice', 'holePunchPrice'] },
    { title: 'Operational costs', keys: ['overheadPercent', 'profitMargin', 'vatPercent', 'platformFeePercent'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pricing</h2>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-1.5" /> {saving ? 'Saving...' : 'Save pricing'}
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div key={section.title} className="bg-card rounded-xl border shadow-sm">
            <div className="px-5 py-3.5 border-b">
              <h3 className="text-sm font-semibold">{section.title}</h3>
            </div>
            <div className="p-5 space-y-3">
              {section.keys.map((key) => (
                <div key={key}>
                  <label className="text-xs text-foreground/60 block mb-1 capitalize">
                    {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-foreground/50 w-7">KES</span>
                    <Input type="number" step="0.01" min="0"
                      value={pricing?.[key] ?? 0}
                      onChange={(e) => updatePrice(key, e.target.value)}
                      className="h-8 text-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
