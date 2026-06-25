'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Loader2, TrendingUp, BarChart3, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563eb', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [hoursData, setHoursData] = useState<any[]>([]);
  const [printerData, setPrinterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const shops = await api.shops.mine();
      if (shops.length === 0) { setLoading(false); return; }
      const shopId = shops[0].id;
      const [s, r, o, h, p] = await Promise.all([
        api.analytics.dashboard(shopId),
        api.analytics.revenue(shopId),
        api.analytics.orders(shopId),
        api.analytics.hours(shopId),
        api.analytics.printer(shopId),
      ]);
      setStats(s); setRevenueData(r); setOrdersData(o); setHoursData(h); setPrinterData(p);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="px-6 py-4 border-b"><h3 className="text-sm font-semibold">{title}</h3></div>
      <div className="p-6">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Analytics</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: TrendingUp },
          { label: 'Total orders', value: stats?.totalOrders || 0, icon: BarChart3 },
          { label: 'Active orders', value: stats?.activeOrders || 0, icon: TrendingUp },
          { label: 'Avg order value', value: formatCurrency(stats?.averageOrderValue || 0), icon: TrendingDown },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground/60 uppercase tracking-wider">{s.label}</span>
              <s.icon className="h-4 w-4 text-foreground/30" />
            </div>
            <div className="text-2xl font-semibold tracking-tight mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue trend (30 days)">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Daily orders">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#2563eb" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Peak hours">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickLine={false} tickFormatter={(h) => `${h}:00`} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e40af" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Printer utilization">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'B&W Pages', value: printerData?.bwPages || 0 },
                    { name: 'Color Pages', value: printerData?.colorPages || 0 },
                  ]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                >
                  {COLORS.slice(0, 2).map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs mt-3">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#2563eb' }} /> B&W: {printerData?.bwPages || 0}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#1e40af' }} /> Color: {printerData?.colorPages || 0}
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
