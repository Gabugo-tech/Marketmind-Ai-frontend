import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-xl px-3 py-2.5 shadow-lg text-xs">
      <p className="text-navy-300 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export const AnalyticsPage: React.FC = () => {
  const { data: monthly } = useQuery({
    queryKey: ['monthly-comparison'],
    queryFn: async () => (await api.get('/analytics/monthly-comparison')).data.data,
  });

  const { data: topProducts } = useQuery({
    queryKey: ['top-products-analytics'],
    queryFn: async () => (await api.get('/analytics/top-products?limit=10&days=30')).data.data,
  });

  const { data: slowMoving } = useQuery({
    queryKey: ['slow-moving'],
    queryFn: async () => (await api.get('/analytics/slow-moving')).data.data,
  });

  const { data: distribution } = useQuery({
    queryKey: ['inventory-distribution'],
    queryFn: async () => (await api.get('/analytics/inventory-distribution')).data.data,
  });

  const { data: trend30 } = useQuery({
    queryKey: ['sales-trend-30'],
    queryFn: async () => (await api.get('/analytics/sales-trend?days=30')).data.data,
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-white">Business Analytics</h2>
        <p className="text-sm text-navy-400">All data sourced from your actual sales records</p>
      </div>

      {/* Monthly comparison */}
      <Card padding="md">
        <CardHeader>
          <CardTitle>Monthly Revenue & Profit</CardTitle>
          <span className="text-xs text-navy-400">Last 6 months</span>
        </CardHeader>
        {!monthly ? <LoadingSpinner className="py-10" /> : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Bar dataKey="revenue" fill="#3b82f6" fillOpacity={0.8} name="Revenue" radius={[3, 3, 0, 0]} />
                <Bar dataKey="profit" fill="#10b981" fillOpacity={0.8} name="Profit" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Row: top products + inventory distribution */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Top products */}
        <Card padding="md" className="lg:col-span-3">
          <CardHeader><CardTitle>Top 10 Products — Last 30 Days</CardTitle></CardHeader>
          {!topProducts ? <LoadingSpinner className="py-10" /> : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="productName" width={120} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="totalRevenue" fill="#10b981" fillOpacity={0.8} name="Revenue" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Inventory distribution */}
        <Card padding="md" className="lg:col-span-2">
          <CardHeader><CardTitle>Inventory by Category</CardTitle></CardHeader>
          {!distribution ? <LoadingSpinner className="py-10" /> : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribution} dataKey="totalValue" nameKey="categoryName" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false} fontSize={9}>
                    {distribution.map((_: unknown, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Daily trend (30 days) */}
      <Card padding="md">
        <CardHeader><CardTitle>Daily Sales Trend — Last 30 Days</CardTitle></CardHeader>
        {!trend30 ? <LoadingSpinner className="py-10" /> : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend30} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(d) => formatDate(d, 'dd')} interval={4} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} name="Revenue" />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} dot={false} name="Profit" strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Slow moving */}
      {slowMoving?.length > 0 && (
        <Card padding="md">
          <CardHeader>
            <CardTitle>Slow-Moving Products</CardTitle>
            <span className="text-xs text-navy-400">Fewer than 3 units sold in 30 days</span>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-navy-700">
                {['Product', 'Units Sold (30d)', 'Current Stock', 'Inventory Value'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-navy-400 uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-navy-700/50">
                {slowMoving.map((p: { productId: string; productName: string; unitsSoldInPeriod: number; currentStock: number; inventoryValue: number }) => (
                  <tr key={p.productId} className="hover:bg-navy-700/30">
                    <td className="px-4 py-3 text-sm text-white">{p.productName}</td>
                    <td className="px-4 py-3 text-sm text-amber-400 font-semibold">{p.unitsSoldInPeriod}</td>
                    <td className="px-4 py-3 text-sm text-navy-300">{p.currentStock}</td>
                    <td className="px-4 py-3 text-sm text-navy-300">{formatCurrency(p.inventoryValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
