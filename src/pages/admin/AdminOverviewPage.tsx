import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Users, Store, DollarSign, ShoppingCart, TrendingUp, Award } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';

function StatCard({ title, value, sub, icon: Icon, color }: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex flex-col gap-3 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <div className={`p-2 rounded-lg ${color}`}><Icon size={16} /></div>
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-xs shadow-lg">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value > 1000 ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export const AdminOverviewPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await adminApi.get('/stats')).data.data,
    refetchInterval: 60_000,
  });

  const { data: trend } = useQuery({
    queryKey: ['admin-revenue-trend'],
    queryFn: async () => (await adminApi.get('/revenue-trend?days=30')).data.data,
  });

  const { data: topBiz } = useQuery({
    queryKey: ['admin-top-businesses'],
    queryFn: async () => (await adminApi.get('/top-businesses?limit=8')).data.data,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-white">Platform Overview</h2>
        <p className="text-sm text-slate-400">Live metrics across all traders on MarketMind AI</p>
      </div>

      {/* KPI cards */}
      {statsLoading ? <LoadingSpinner className="py-10" /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Total Users"     value={stats?.totalUsers ?? 0}      sub={`${stats?.newUsersThisMonth ?? 0} new this month`} icon={Users}        color="bg-blue-500/15 text-blue-400" />
          <StatCard title="Businesses"      value={stats?.totalBusinesses ?? 0} sub="Registered businesses"                             icon={Store}        color="bg-purple-500/15 text-purple-400" />
          <StatCard title="Platform Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} sub={`${stats?.totalSalesCount ?? 0} transactions`} icon={DollarSign} color="bg-emerald-500/15 text-emerald-400" />
          <StatCard title="Total Profit"    value={formatCurrency(stats?.totalProfit ?? 0)}   sub="Gross profit platform-wide"               icon={TrendingUp}  color="bg-amber-500/15 text-amber-400" />
        </div>
      )}

      {/* Revenue trend chart */}
      <Card padding="md" className="!bg-slate-900 !border-slate-700">
        <CardHeader>
          <CardTitle className="!text-slate-300">Platform Revenue — Last 30 Days</CardTitle>
          <span className="text-xs text-slate-500">All businesses combined</span>
        </CardHeader>
        {!trend ? <LoadingSpinner className="py-10" /> : (
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="proG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={(d) => d.slice(5)} interval={6} />
                <YAxis tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}K`} width={40} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="revenue" stroke="#ef4444" fill="url(#revG)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="profit"  stroke="#10b981" fill="url(#proG)" strokeWidth={2} name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Top businesses */}
      <Card padding="md" className="!bg-slate-900 !border-slate-700">
        <CardHeader>
          <CardTitle className="!text-slate-300">Top Businesses by Revenue</CardTitle>
          <Award size={16} className="text-amber-400" />
        </CardHeader>
        {!topBiz ? <LoadingSpinner className="py-8" /> : (
          <>
            {/* Chart */}
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topBiz.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="totalRevenue" fill="#ef4444" fillOpacity={0.8} name="Revenue" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['#', 'Business', 'Owner', 'Category', 'Revenue', 'Profit'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {topBiz.map((b: any, i: number) => (
                    <tr key={b.id} className="hover:bg-slate-800/50">
                      <td className="px-3 py-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center justify-center">{i + 1}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-sm font-medium text-white">{b.name}</p>
                        <p className="text-[10px] text-slate-500">{b.location}</p>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-400">{b.owner}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-400">{b.category.replace(/_/g, ' ')}</td>
                      <td className="px-3 py-2.5 text-sm font-semibold text-white">{formatCurrency(b.totalRevenue)}</td>
                      <td className="px-3 py-2.5 text-sm text-emerald-400">+{formatCurrency(b.totalProfit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
