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
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Sale } from '@/types';
import { NewSaleForm } from './NewSaleForm';

const PAYMENT_LABELS: Record<string, string> = {
  CASH: 'Cash', BANK_TRANSFER: 'Transfer', POS: 'POS', MOBILE_MONEY: 'M-Money',
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
    <div className="space-y-4 animate-fade-in">
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
      <div className="flex gap-2">
        <div className="flex-1">
          <Input placeholder="Search reference..." value={search}
            onChange={(e) => setSearch(e.target.value)} leftIcon={<Search size={16} />} />
        </div>
        <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
          options={[
            { value: '', label: 'All' },
            { value: 'CASH', label: 'Cash' },
            { value: 'BANK_TRANSFER', label: 'Transfer' },
            { value: 'POS', label: 'POS' },
          ]}
          className="w-28"
        />
      </div>

      <Card padding="none">
        {isLoading ? (
          <LoadingSpinner className="py-16" />
        ) : sales.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart size={28} />}
            title={search || paymentFilter ? 'No sales match filters' : 'No sales recorded'}
            description={!search && !paymentFilter ? 'Record your first sale to start tracking performance' : undefined}
            action={!search && !paymentFilter ? <Button icon={<Plus size={16} />} onClick={() => setShowNewSale(true)}>Record Sale</Button> : undefined}
          />
        ) : (
          <div className="divide-y divide-navy-700/50">
            {sales.map((s) => (
              <div key={s.id} className="px-4 py-3.5 hover:bg-navy-700/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-mono font-medium text-brand-400">{s.referenceNumber}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs text-navy-400">{formatDate(s.soldAt, 'dd MMM, hh:mm a')}</p>
                      <Badge variant="neutral" size="sm">{PAYMENT_LABELS[s.paymentMethod] ?? s.paymentMethod}</Badge>
                    </div>
                    {s.customerName && <p className="text-xs text-navy-500 mt-0.5">{s.customerName}</p>}
                    {s.items?.length > 0 && (
                      <p className="text-xs text-navy-500 mt-1 truncate">
                        {s.items.slice(0, 2).map(i => `${i.productName}×${i.quantity}`).join(', ')}
                        {s.items.length > 2 && ` +${s.items.length - 2} more`}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">{formatCurrency(Number(s.total))}</p>
                    <p className="text-xs text-brand-400 mt-0.5">+{formatCurrency(Number(s.grossProfit))}</p>
                  </div>
                </div>
              </div>
            ))}
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
