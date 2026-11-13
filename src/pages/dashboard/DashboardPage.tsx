import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Package, AlertTriangle, ShoppingCart,
  DollarSign, BarChart2, Boxes,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { api } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, EmptyState } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency, formatDate, getStockStatusLabel } from '@/lib/utils';
import type { DashboardStats, Product } from '@/types';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="text-navy-300 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold text-white">
          {p.name === 'revenue' ? 'Revenue: ' : 'Profit: '}
          {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { user, currentBusiness } = useAuthStore();
  const business = currentBusiness();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get('/analytics/dashboard')).data.data,
    refetchInterval: 60_000,
  });

  const { data: trend } = useQuery({
    queryKey: ['sales-trend', 30],
    queryFn: async () => (await api.get('/analytics/sales-trend?days=30')).data.data,
  });

  const { data: topProducts } = useQuery({
    queryKey: ['top-products'],
    queryFn: async () => (await api.get('/analytics/top-products?limit=5')).data.data,
  });

  const { data: lowStockProducts } = useQuery<Product[]>({
    queryKey: ['low-stock-products'],
    queryFn: async () => (await api.get('/inventory/products?status=low_stock&limit=5')).data.data,
  });

  const { data: recentSales } = useQuery({
    queryKey: ['recent-sales'],
    queryFn: async () => (await api.get('/sales?limit=5')).data.data,
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            {greeting()}, {user?.firstName} 👋
          </h2>
          <p className="text-sm text-navy-400 mt-0.5">
            {business?.name} · {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/sales">
          <Button size="sm" icon={<ShoppingCart size={15} />}>Record Sale</Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats?.salesToday ?? 0)}
          subtitle={`${stats?.transactionsToday ?? 0} transactions`}
          icon={<DollarSign size={18} />}
          loading={statsLoading}
        />
        <StatCard
          title="Today's Profit"
          value={formatCurrency(stats?.profitToday ?? 0)}
          subtitle="Gross profit"
          icon={<TrendingUp size={18} />}
          iconBg="bg-blue-500/15"
          loading={statsLoading}
        />
        <StatCard
          title="This Month"
          value={formatCurrency(stats?.salesThisMonth ?? 0)}
          subtitle={formatCurrency(stats?.profitThisMonth ?? 0) + ' profit'}
          icon={<BarChart2 size={18} />}
          iconBg="bg-purple-500/15"
          loading={statsLoading}
        />
        <StatCard
          title="Inventory Value"
          value={formatCurrency(stats?.totalInventoryValue ?? 0)}
          subtitle={`${stats?.totalProducts ?? 0} products`}
          icon={<Boxes size={18} />}
          iconBg="bg-amber-500/15"
          loading={statsLoading}
        />
      </div>

      {/* Alert strip */}
      {((stats?.outOfStockCount ?? 0) > 0 || (stats?.criticalStockCount ?? 0) > 0) && (
        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-300 flex-1">
            <span className="font-semibold">{stats!.outOfStockCount} products out of stock</span>
            {stats!.criticalStockCount > 0 && `, ${stats!.criticalStockCount} critically low`}
            . Restock needed.
          </p>
          <Link to="/forecasting">
            <Button size="xs" variant="danger">View →</Button>
          </Link>
        </div>
      )}

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Sales trend */}
        <Card className="lg:col-span-2" padding="md">
          <CardHeader>
            <CardTitle>Sales Trend — Last 30 Days</CardTitle>
            <span className="text-xs text-navy-400">Revenue & Profit</span>
          </CardHeader>
          <div className="h-52">
            {trend ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(d) => formatDate(d, 'dd MMM')} interval={6} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2} name="revenue" />
                  <Area type="monotone" dataKey="profit" stroke="#3b82f6" fill="url(#profGrad)" strokeWidth={2} name="profit" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <LoadingSpinner />
              </div>
            )}
          </div>
        </Card>

        {/* Top products */}
        <Card padding="md">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <Link to="/analytics" className="text-xs text-brand-400 hover:text-brand-300">See all →</Link>
          </CardHeader>
          <div className="space-y-3">
            {topProducts?.slice(0, 5).map((p: { productId: string; productName: string; totalRevenue: number; totalQuantity: number }, i: number) => (
              <div key={p.productId} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-navy-700 flex items-center justify-center text-xs font-bold text-navy-300">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{p.productName}</p>
                  <p className="text-[10px] text-navy-400">{p.totalQuantity} units sold</p>
                </div>
                <span className="text-xs font-semibold text-brand-400">{formatCurrency(p.totalRevenue)}</span>
              </div>
            )) ?? <LoadingSpinner className="py-6" />}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Low stock */}
        <Card padding="md">
          <CardHeader>
            <CardTitle>Stock Alerts</CardTitle>
            <Link to="/inventory" className="text-xs text-brand-400 hover:text-brand-300">Manage →</Link>
          </CardHeader>
          {!lowStockProducts ? (
            <LoadingSpinner className="py-6" />
          ) : lowStockProducts.length === 0 ? (
            <EmptyState icon={<Package size={20} />} title="All stock levels healthy" />
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 bg-navy-700/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-navy-400">{p.quantity} units remaining</p>
                  </div>
                  <Badge
                    variant={p.stockStatus === 'OUT_OF_STOCK' ? 'danger' : p.stockStatus === 'CRITICAL_STOCK' ? 'danger' : 'warning'}
                  >
                    {getStockStatusLabel(p.stockStatus)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent sales */}
        <Card padding="md">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <Link to="/sales" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
          </CardHeader>
          {!recentSales ? (
            <LoadingSpinner className="py-6" />
          ) : recentSales.length === 0 ? (
            <EmptyState icon={<ShoppingCart size={20} />} title="No transactions yet" description="Record your first sale to get started" />
          ) : (
            <div className="space-y-2">
              {recentSales.map((s: { id: string; referenceNumber: string; soldAt: string; total: number; grossProfit: number; paymentMethod: string }) => (
                <Link key={s.id} to="/sales" className="flex items-center gap-3 p-2.5 bg-navy-700/50 hover:bg-navy-700 rounded-lg transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white">{s.referenceNumber}</p>
                    <p className="text-[10px] text-navy-400">{formatDate(s.soldAt, 'dd MMM, hh:mm a')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-white">{formatCurrency(Number(s.total))}</p>
                    <p className="text-[10px] text-brand-400">+{formatCurrency(Number(s.grossProfit))}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
