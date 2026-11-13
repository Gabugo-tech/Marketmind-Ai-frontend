import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, TruckIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Purchase } from '@/types';
import { NewPurchaseForm } from './NewPurchaseForm';

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PAID: 'Paid', PARTIAL: 'Partial', PENDING: 'Pending', OVERDUE: 'Overdue',
};

export const PurchasesPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['purchases', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '30' });
      if (search) params.set('search', search);
      return (await api.get(`/purchases?${params}`)).data;
    },
  });

  const purchases: Purchase[] = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Purchases</h2>
          <p className="text-sm text-navy-400">{data?.pagination?.total ?? 0} purchase records</p>
        </div>
        <Button size="sm" icon={<Plus size={16} />} onClick={() => setShowNew(true)}>Record Purchase</Button>
      </div>

      <Input placeholder="Search reference, supplier..." value={search}
        onChange={(e) => setSearch(e.target.value)} leftIcon={<Search size={16} />} className="max-w-80" />

      <Card padding="none">
        {isLoading ? <LoadingSpinner className="py-16" /> : purchases.length === 0 ? (
          <EmptyState icon={<TruckIcon size={28} />} title="No purchases recorded"
            action={<Button icon={<Plus size={16} />} onClick={() => setShowNew(true)}>Record Purchase</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-700">
                  {['Reference', 'Date', 'Supplier', 'Items', 'Total', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-navy-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700/50">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-navy-700/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-mono text-brand-400">{p.referenceNumber}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-navy-300">{formatDateTime(p.purchasedAt)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-white">{p.supplierName ?? '—'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-navy-400">
                        {p.items?.map((i) => `${i.productName}×${i.quantity}`).join(', ').slice(0, 40) ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-white">{formatCurrency(Number(p.total))}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={p.paymentStatus === 'PAID' ? 'success' : p.paymentStatus === 'PENDING' ? 'warning' : p.paymentStatus === 'OVERDUE' ? 'danger' : 'neutral'} dot>
                        {PAYMENT_STATUS_LABELS[p.paymentStatus] ?? p.paymentStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Record Purchase" size="lg">
        <NewPurchaseForm onSuccess={() => { setShowNew(false); qc.invalidateQueries({ queryKey: ['purchases'] }); qc.invalidateQueries({ queryKey: ['products'] }); }} />
      </Modal>
    </div>
  );
};
