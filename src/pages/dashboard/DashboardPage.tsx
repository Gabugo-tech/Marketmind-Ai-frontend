import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, AlertTriangle, ShoppingCart, DollarSign, BarChart2, Boxes } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner, EmptyState } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency, formatDate, getStockStatusLabel } from '@/lib/utils';
import { NewSaleForm } from '@/pages/sales/NewSaleForm';
import type { DashboardStats, Product } from '@/types';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="text-navy-300 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold text-white">
          {p.name === 'revenue' ? 'Revenue: ' : 'Profit: '}{formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { user, currentBusiness } = useAuthStore();
  const business = currentBusiness();
  const qc = useQueryClient();
  const [showSaleModal, setShowSaleModal] = useState(false);

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

  const { data: alertProducts } = useQuery<Product[]>({
    queryKey: ['alert-products'],
    queryFn: async () => (await api.get('/inventory/products?limit=20')).data.data,
    select: (data: Product[]) => data.filter(p =>
      p.stockStatus === 'OUT_OF_STOCK' || p.stockStatus === 'CRITICAL_STOCK' || p.stockStatus === 'LOW_STOCK'
    ),
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

  const STOCK_BADGE: Record<string, 'danger' | 'warning'> = {
    OUT_OF_STOCK: 'danger', CRITICAL_STOCK: 'danger', LOW_STOCK: 'warning',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {greeting()}, {user?.firstName} 👋
          </h2>
          <p className="text-xs sm:text-sm text-navy-400 mt-0.5 truncate">
            {business?.name}
          </p>
        </div>
        <Button size="sm" icon={<ShoppingCart size={15} />} onClick={() => setShowSaleModal(true)}>
          <span className="hidden sm:inline">Record </span>Sale
        </Button>
      </div>

      {/* KPI Cards - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="Today's Sales" value={formatCurrency(stats?.salesToday ?? 0)} subtitle={`${stats?.transactionsToday ?? 0} transactions`} icon={<DollarSign size={18} />} loading={statsLoading} />
        <StatCard title="Today's Profit" value={formatCurrency(stats?.profitToday ?? 0)} subtitle="Gross profit" icon={<TrendingUp size={18} />} iconBg="bg-blue-500/15" loading={statsLoading} />
        <StatCard title="This Month" value={formatCurrency(stats?.salesThisMonth ?? 0)} subtitle={formatCurrency(stats?.profitThisMonth ?? 0) + ' profit'} icon={<BarChart2 size={18} />} iconBg="bg-purple-500/15" loading={statsLoading} />
        <StatCard title="Inventory" value={formatCurrency(stats?.totalInventoryValue ?? 0)} subtitle={`${stats?.totalProducts ?? 0} products`} icon={<Boxes size={18} />} iconBg="bg-amber-500/15" loading={statsLoading} />
      </div>

      {/* Alert strip */}
      {((stats?.outOfStockCount ?? 0) > 0 || (stats?.criticalStockCount ?? 0) > 0) && (
        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <p className="text-xs sm:text-sm text-red-300 flex-1">
            <span className="font-semibold">{stats!.outOfStockCount} out of stock</span>
            {stats!.criticalStockCount > 0 && `, ${stats!.criticalStockCount} critical`}.
          </p>
          <Link to="/forecasting"><Button size="xs" variant="danger">View</Button></Link>
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" padding="md">
          <CardHeader>
            <CardTitle>Sales Trend — 30 Days</CardTitle>
            <span className="text-xs text-navy-400 hidden sm:block">Revenue & Profit</span>
          </CardHeader>
          <div className="h-44 sm:h-52">
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
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={(d) => formatDate(d, 'dd MMM')} interval={6} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}K`} width={45} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2} name="revenue" />
                  <Area type="monotone" dataKey="profit" stroke="#3b82f6" fill="url(#profGrad)" strokeWidth={2} name="profit" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>}
          </div>
        </Card>

        <Card padding="md">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <Link to="/analytics" className="text-xs text-brand-400">See all →</Link>
          </CardHeader>
          <div className="space-y-2.5">
            {topProducts?.length > 0 ? topProducts.slice(0, 5).map((p: { productId: string; productName: string; totalRevenue: number; totalQuantity: number }, i: number) => (
              <div key={p.productId} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-navy-700 flex items-center justify-center text-[10px] font-bold text-navy-300 shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{p.productName}</p>
                  <p className="text-[10px] text-navy-400">{p.totalQuantity} sold</p>
                </div>
                <span className="text-xs font-semibold text-brand-400 shrink-0">
                  {p.totalRevenue > 0 ? formatCurrency(p.totalRevenue) : <span className="text-navy-500">—</span>}
                </span>
              </div>
            )) : !topProducts ? <LoadingSpinner className="py-4" /> : (
              <p className="text-xs text-navy-500 text-center py-4">Record sales to see top products</p>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card padding="md">
          <CardHeader>
            <CardTitle>Stock Alerts</CardTitle>
            <Link to="/inventory" className="text-xs text-brand-400">Manage →</Link>
          </CardHeader>
          {!alertProducts ? <LoadingSpinner className="py-4" /> : alertProducts.length === 0 ? (
            <EmptyState icon={<Package size={18} />} title="All stock levels healthy" />
          ) : (
            <div className="space-y-2">
              {alertProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 bg-navy-700/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-navy-400">{p.quantity} units left</p>
                  </div>
                  <Badge variant={STOCK_BADGE[p.stockStatus] ?? 'warning'} size="sm">
                    {getStockStatusLabel(p.stockStatus)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padding="md">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <Link to="/sales" className="text-xs text-brand-400">View all →</Link>
          </CardHeader>
          {!recentSales ? <LoadingSpinner className="py-4" /> : recentSales.length === 0 ? (
            <EmptyState icon={<ShoppingCart size={18} />} title="No transactions yet"
              action={<Button size="sm" onClick={() => setShowSaleModal(true)}>Record Sale</Button>} />
          ) : (
            <div className="space-y-2">
              {recentSales.map((s: { id: string; referenceNumber: string; soldAt: string; total: number; grossProfit: number }) => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 bg-navy-700/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white">{s.referenceNumber}</p>
                    <p className="text-[10px] text-navy-400">{formatDate(s.soldAt, 'dd MMM, hh:mm a')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-white">{formatCurrency(Number(s.total))}</p>
                    <p className="text-[10px] text-brand-400">+{formatCurrency(Number(s.grossProfit))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal open={showSaleModal} onClose={() => setShowSaleModal(false)} title="Record New Sale" size="xl">
        <NewSaleForm onSuccess={() => {
          setShowSaleModal(false);
          qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
          qc.invalidateQueries({ queryKey: ['sales'] });
          qc.invalidateQueries({ queryKey: ['alert-products'] });
          qc.invalidateQueries({ queryKey: ['top-products'] });
          qc.invalidateQueries({ queryKey: ['sales-trend'] });
        }} />
      </Modal>
    </div>
  );
};
