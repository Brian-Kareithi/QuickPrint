'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save } from 'lucide-react';

export default function SettingsPage() {
  const [shop, setShop] = useState<any>(null);
  const [form, setForm] = useState({
    name: '', description: '', email: '', phone: '', address: '', welcomeMessage: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.shops.mine().then((shops) => {
      if (shops.length > 0) {
        api.shops.byId(shops[0].id).then((s) => {
          setShop(s);
          setForm({
            name: s.name, description: s.description || '', email: s.email || '',
            phone: s.phone || '', address: s.address || '', welcomeMessage: s.welcomeMessage || '',
          });
        });
      }
    });
  }, []);

  const handleSave = async () => {
    if (!shop) return;
    setSaving(true);
    await api.shops.update(shop.id, form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!shop) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-lg font-semibold">Shop settings</h2>
      <div className="bg-card rounded-xl border shadow-sm p-6 space-y-5">
        {([
          { key: 'name', label: 'Shop name', type: 'text' },
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'phone', label: 'Phone', type: 'tel' },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'address', label: 'Address', type: 'textarea' },
          { key: 'welcomeMessage', label: 'Welcome message', type: 'textarea' },
        ] as const).map(({ key, label, type }) => (
          <div key={key}>
            <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider block mb-1.5">{label}</label>
            {type === 'textarea' ? (
              <textarea value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                rows={key === 'welcomeMessage' ? 3 : 2} />
            ) : (
              <Input value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            )}
          </div>
        ))}
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-1.5" /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}
