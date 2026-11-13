import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, ShoppingCart } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Sale } from '@/types';
import { NewSaleForm } from './NewSaleForm';

const PAYMENT_LABELS: Record<string, string> = {
  CASH: 'Cash', BANK_TRANSFER: 'Transfer', POS: 'POS', MOBILE_MONEY: 'Mobile Money',
  CREDIT: 'Credit', OTHER: 'Other',
};

export const SalesPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [showNewSale, setShowNewSale] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['sales', search, paymentFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '30' });
      if (search) params.set('search', search);
      if (paymentFilter) params.set('paymentMethod', paymentFilter);
      return (await api.get(`/sales?${params}`)).data;
    },
  });

  const sales: Sale[] = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Sales</h2>
          <p className="text-sm text-navy-400">{data?.pagination?.total ?? 0} transactions</p>
        </div>
        <Button size="sm" icon={<Plus size={16} />} onClick={() => setShowNewSale(true)}>
          Record Sale
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <Input placeholder="Search reference, customer..." value={search}
            onChange={(e) => setSearch(e.target.value)} leftIcon={<Search size={16} />} />
        </div>
        <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
          options={[
            { value: '', label: 'All payments' },
            { value: 'CASH', label: 'Cash' },
            { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
            { value: 'POS', label: 'POS' },
          ]}
          className="w-40"
        />
      </div>

      <Card padding="none">
        {isLoading ? (
          <LoadingSpinner className="py-16" />
        ) : sales.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart size={28} />}
            title={search || paymentFilter ? 'No sales match your filters' : 'No sales recorded'}
            description={search || paymentFilter ? 'Try clearing your filters' : 'Record your first sale to start tracking performance'}
            action={!search && !paymentFilter ? <Button icon={<Plus size={16} />} onClick={() => setShowNewSale(true)}>Record Sale</Button> : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-700">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-navy-400 uppercase tracking-wider">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-navy-400 uppercase tracking-wider hidden sm:table-cell">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-navy-400 uppercase tracking-wider hidden md:table-cell">Items</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-navy-400 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-navy-400 uppercase tracking-wider hidden sm:table-cell">Profit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-navy-400 uppercase tracking-wider">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700/50">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-navy-700/30 transition-colors cursor-pointer">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-mono font-medium text-brand-400">{s.referenceNumber}</p>
                      {s.customerName && <p className="text-xs text-navy-400">{s.customerName}</p>}
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-xs text-navy-300">{formatDateTime(s.soldAt)}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {s.items?.slice(0, 2).map((item, i) => (
                          <span key={i} className="text-xs bg-navy-700 text-navy-300 px-2 py-0.5 rounded-md">
                            {item.productName} ×{item.quantity}
                          </span>
                        ))}
                        {(s.items?.length ?? 0) > 2 && (
                          <span className="text-xs text-navy-400">+{s.items.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-semibold text-white">{formatCurrency(Number(s.total))}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                      <span className="text-sm font-semibold text-brand-400">+{formatCurrency(Number(s.grossProfit))}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="neutral">{PAYMENT_LABELS[s.paymentMethod] ?? s.paymentMethod}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={showNewSale} onClose={() => setShowNewSale(false)} title="Record New Sale" size="xl">
        <NewSaleForm onSuccess={() => {
          setShowNewSale(false);
          qc.invalidateQueries({ queryKey: ['sales'] });
          qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
          qc.invalidateQueries({ queryKey: ['products'] });
        }} />
      </Modal>
    </div>
  );
};
