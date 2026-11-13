import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Package, RefreshCw } from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, ReferenceLine, Legend
} from 'recharts';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { LoadingSpinner, EmptyState } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, getUrgencyColor, cn } from '@/lib/utils';
import type { ForecastResult, RestockRecommendation } from '@/types';

const FORECAST_DAYS = [
  { value: '7', label: 'Next 7 days' },
  { value: '14', label: 'Next 14 days' },
  { value: '30', label: 'Next 30 days' },
];

const URGENCY_ICONS = {
  IMMEDIATE: <AlertTriangle size={15} className="text-red-400" />,
  SOON: <Clock size={15} className="text-amber-400" />,
  SUFFICIENT: <CheckCircle size={15} className="text-emerald-400" />,
};

const ForecastChart: React.FC<{ result: ForecastResult }> = ({ result }) => {
  const data = result.forecastPoints.slice(-40).map((p) => ({
    date: formatDate(p.date, 'dd MMM'),
    actual: p.actual,
    predicted: p.predicted,
    confidenceLow: p.confidenceLow,
    confidenceHigh: p.confidenceHigh,
    isForecasted: p.isForecasted,
  }));

  const splitIndex = data.reduce((acc, d, i) => (!d.isForecasted ? i : acc), -1);

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} interval={3} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
          {splitIndex >= 0 && (
            <ReferenceLine x={data[splitIndex]?.date} stroke="#475569" strokeDasharray="4 4" label={{ value: 'Today', fill: '#64748b', fontSize: 10 }} />
          )}
          <Bar dataKey="actual" fill="#3b82f6" fillOpacity={0.7} name="Actual Sales" radius={[2, 2, 0, 0]} />
          <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} dot={false} name="AI Forecast" />
          {result.forecastPoints.some((p) => p.confidenceLow) && (
            <Area type="monotone" dataKey="confidenceHigh" fill="#10b981" fillOpacity={0.08} stroke="none" name="Confidence Band" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ForecastingPage: React.FC = () => {
  const [days, setDays] = useState<'7' | '14' | '30'>('14');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Fix #6: proper loading + isFetching for re-run feedback
  const {
    data: forecasts,
    isLoading: forecastLoading,
    isFetching: forecastFetching,
    refetch: runForecast,
  } = useQuery<ForecastResult[]>({
    queryKey: ['forecasts-all', days],
    queryFn: async () => (await api.get(`/forecasting/all?days=${days}`)).data.data,
    staleTime: 5 * 60_000,
  });

  const { data: recommendations, isLoading: restockLoading } = useQuery<RestockRecommendation[]>({
    queryKey: ['restock-recommendations'],
    queryFn: async () => (await api.get('/forecasting/restock-recommendations')).data.data,
    staleTime: 5 * 60_000,
  });

  const selectedForecast = forecasts?.find((f) => f.productId === selectedProduct) ?? forecasts?.[0];
  const immediateCount = recommendations?.filter((r) => r.urgency === 'IMMEDIATE').length ?? 0;
  const soonCount = recommendations?.filter((r) => r.urgency === 'SOON').length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            AI Sales Forecasting
          </h2>
          <p className="text-sm text-navy-400 mt-0.5">
            Demand predictions using Holt's Exponential Smoothing on your actual sales history
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select
            value={days}
            onChange={(e) => setDays(e.target.value as '7' | '14' | '30')}
            options={FORECAST_DAYS}
            className="w-36"
          />
          {/* Fix #6: shows spinner when re-running */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => runForecast()}
            loading={forecastFetching}
            icon={!forecastFetching ? <RefreshCw size={14} /> : undefined}
          >
            {forecastFetching ? 'Running...' : 'Re-run'}
          </Button>
        </div>
      </div>

      {/* Alert strip */}
      {immediateCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-300">
            <span className="font-semibold">{immediateCount} product{immediateCount !== 1 ? 's' : ''} need immediate restocking</span>
            {soonCount > 0 && `, ${soonCount} more soon`}.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Product forecast chart */}
        <Card className="lg:col-span-2" padding="md">
          <CardHeader>
            <CardTitle>Demand Forecast — {FORECAST_DAYS.find((d) => d.value === days)?.label}</CardTitle>
            {selectedForecast && (
              <div className="flex items-center gap-2">
                {selectedForecast.mape !== undefined && !selectedForecast.insufficientData && (
                  <span className="text-xs text-navy-400">
                    Accuracy: <span className="text-brand-400">{(100 - (selectedForecast.mape ?? 0)).toFixed(0)}%</span>
                  </span>
                )}
                {/* Fix #7: styled select consistent with UI */}
                <select
                  value={selectedProduct ?? ''}
                  onChange={(e) => setSelectedProduct(e.target.value || null)}
                  className="text-xs bg-navy-700 border border-navy-600 text-navy-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 max-w-44 cursor-pointer"
                >
                  {forecasts?.map((f) => (
                    <option key={f.productId} value={f.productId}>{f.productName}</option>
                  ))}
                </select>
              </div>
            )}
          </CardHeader>

          {forecastLoading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <LoadingSpinner size="lg" />
              <p className="text-xs text-navy-400">Analysing your sales history...</p>
            </div>
          ) : !selectedForecast ? (
            <EmptyState icon={<TrendingUp size={24} />} title="No forecast data" description="Add products and record sales to generate forecasts" />
          ) : (
            <>
              {selectedForecast.insufficientData && (
                <div className="mb-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-300">{selectedForecast.message}</p>
                </div>
              )}
              <ForecastChart result={selectedForecast} />
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="p-3 bg-navy-700/50 rounded-xl text-center">
                  <p className="text-xs text-navy-400">Avg Daily</p>
                  <p className="text-lg font-bold text-white mt-0.5">{selectedForecast.dailyAverage}</p>
                  <p className="text-xs text-navy-400">units/day</p>
                </div>
                <div className="p-3 bg-navy-700/50 rounded-xl text-center">
                  <p className="text-xs text-navy-400">Predicted Total</p>
                  <p className="text-lg font-bold text-brand-400 mt-0.5">{Math.round(selectedForecast.predictedTotal)}</p>
                  <p className="text-xs text-navy-400">units in {days} days</p>
                </div>
                <div className="p-3 bg-navy-700/50 rounded-xl text-center">
                  <p className="text-xs text-navy-400">Method</p>
                  <p className="text-xs font-semibold text-white mt-0.5">
                    {selectedForecast.method === 'DOUBLE_EXPONENTIAL_SMOOTHING' ? "Holt's DES" :
                     selectedForecast.method === 'MOVING_AVERAGE' ? 'Moving Avg' : 'Baseline'}
                  </p>
                  <p className="text-xs text-navy-400">{selectedForecast.dataPointsUsed} data points</p>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Restock sidebar */}
        <Card padding="md">
          <CardHeader>
            <CardTitle>Restock Intelligence</CardTitle>
            <span className="text-xs text-navy-400">{recommendations?.length ?? 0} products</span>
          </CardHeader>
          {restockLoading ? (
            <LoadingSpinner className="py-8" />
          ) : !recommendations?.length ? (
            <EmptyState icon={<Package size={20} />} title="No data yet" description="Add products to see recommendations" />
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {recommendations.filter((r) => r.urgency !== 'SUFFICIENT').length === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                  <CheckCircle size={16} className="text-brand-400" />
                  <p className="text-xs text-brand-300 font-medium">All stock levels are sufficient!</p>
                </div>
              ) : recommendations.filter((r) => r.urgency !== 'SUFFICIENT').map((r) => (
                <div key={r.productId} className={cn('p-3 rounded-xl border', getUrgencyColor(r.urgency))}>
                  <div className="flex items-start gap-2">
                    {URGENCY_ICONS[r.urgency]}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{r.productName}</p>
                      <p className="text-[10px] text-navy-300 mt-0.5">{r.reason.slice(0, 80)}…</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-navy-400">
                        <span>Stock: <strong className="text-white">{r.currentStock}</strong></span>
                        <span>Order: <strong className="text-white">{r.recommendedQuantity}</strong></span>
                        {r.daysUntilStockout !== null && (
                          <span>~<strong className="text-white">{r.daysUntilStockout}d</strong> left</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Full table */}
      <Card padding="md">
        <CardHeader><CardTitle>All Restocking Recommendations</CardTitle></CardHeader>
        {restockLoading ? <LoadingSpinner className="py-8" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-700">
                  {['Product', 'Stock', 'Daily Sales', 'Days Left', 'Order Qty', 'Est. Cost', 'Urgency'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-navy-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700/50">
                {!recommendations?.length ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-navy-500">No products found. Add inventory to see recommendations.</td></tr>
                ) : recommendations.map((r) => (
                  <tr key={r.productId} className="hover:bg-navy-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{r.productName}</p>
                      {r.supplierName && <p className="text-xs text-navy-400">{r.supplierName}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-sm font-semibold', r.currentStock <= 0 ? 'text-red-400' : r.currentStock <= r.minStockLevel ? 'text-amber-400' : 'text-white')}>
                        {r.currentStock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-navy-300">{r.avgDailySales.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-sm font-medium', r.daysUntilStockout !== null && r.daysUntilStockout <= 3 ? 'text-red-400' : 'text-navy-300')}>
                        {r.daysUntilStockout !== null ? `${r.daysUntilStockout}d` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><span className="text-sm font-semibold text-brand-400">{r.recommendedQuantity}</span></td>
                    <td className="px-4 py-3 text-sm text-navy-300">{formatCurrency(r.estimatedCost)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.urgency === 'IMMEDIATE' ? 'danger' : r.urgency === 'SOON' ? 'warning' : 'success'} dot>
                        {r.urgency === 'IMMEDIATE' ? 'Now' : r.urgency === 'SOON' ? 'Soon' : 'OK'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
