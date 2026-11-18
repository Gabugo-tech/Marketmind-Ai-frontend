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
import { formatCurrency, formatDate } from '@/lib/utils';
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
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Purchases</h2>
          <p className="text-sm text-navy-400">{data?.pagination?.total ?? 0} records</p>
        </div>
        <Button size="sm" icon={<Plus size={16} />} onClick={() => setShowNew(true)}>
          <span className="hidden sm:inline">Record </span>Purchase
        </Button>
      </div>

      <Input placeholder="Search reference, supplier..." value={search}
        onChange={(e) => setSearch(e.target.value)} leftIcon={<Search size={16} />} />

      <Card padding="none">
        {isLoading ? <LoadingSpinner className="py-16" /> : purchases.length === 0 ? (
          <EmptyState icon={<TruckIcon size={28} />} title="No purchases recorded"
            action={<Button icon={<Plus size={16} />} onClick={() => setShowNew(true)}>Record Purchase</Button>} />
        ) : (
          <div className="divide-y divide-navy-700/50">
            {purchases.map((p) => (
              <div key={p.id} className="px-4 py-3.5 hover:bg-navy-700/20 transition-colors">
                {/* Mobile card layout */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-mono font-medium text-brand-400 truncate">{p.referenceNumber}</p>
                    <p className="text-xs text-navy-400 mt-0.5">{formatDate(p.purchasedAt, 'dd MMM yyyy')}</p>
                    {p.supplierName && <p className="text-xs text-navy-300 mt-0.5">{p.supplierName}</p>}
                    {p.items?.length > 0 && (
                      <p className="text-xs text-navy-500 mt-1 truncate">
                        {p.items.map(i => `${i.productName}×${i.quantity}`).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">{formatCurrency(Number(p.total))}</p>
                    <div className="mt-1">
                      <Badge
                        variant={p.paymentStatus === 'PAID' ? 'success' : p.paymentStatus === 'PENDING' ? 'warning' : p.paymentStatus === 'OVERDUE' ? 'danger' : 'neutral'}
                        dot
                        size="sm"
                      >
                        {PAYMENT_STATUS_LABELS[p.paymentStatus] ?? p.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Record Purchase" size="lg">
        <NewPurchaseForm onSuccess={() => {
          setShowNew(false);
          qc.invalidateQueries({ queryKey: ['purchases'] });
          qc.invalidateQueries({ queryKey: ['products'] });
        }} />
      </Modal>
    </div>
  );
};
