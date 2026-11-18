import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Package, Edit2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, getStockStatusLabel, cn } from '@/lib/utils';
import type { Product } from '@/types';
import toast from 'react-hot-toast';
import { ProductForm } from './ProductForm';

const STOCK_STATUS_VARIANTS = {
  IN_STOCK: 'success',
  LOW_STOCK: 'warning',
  CRITICAL_STOCK: 'danger',
  OUT_OF_STOCK: 'danger',
} as const;

export const InventoryPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '50');
      return (await api.get(`/inventory/products?${params}`)).data;
    },
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/inventory/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Product deleted');
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const products: Product[] = data?.data ?? [];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Inventory</h2>
          <p className="text-sm text-navy-400">{data?.pagination?.total ?? 0} products</p>
        </div>
        <Button size="sm" icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input placeholder="Search products, SKU..." value={search}
            onChange={(e) => setSearch(e.target.value)} leftIcon={<Search size={16} />} />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'All' },
            { value: 'low_stock', label: 'Low' },
            { value: 'out_of_stock', label: 'Out' },
          ]}
          className="w-24"
        />
      </div>

      {/* Products — card layout on mobile, table on desktop */}
      <Card padding="none">
        {isLoading ? (
          <LoadingSpinner className="py-16" />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Package size={28} />}
            title={search || statusFilter ? 'No products match filters' : 'No products found'}
            description={!search && !statusFilter ? 'Add your first product to get started' : undefined}
            action={!search && !statusFilter ? <Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>Add Product</Button> : undefined}
          />
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-navy-700/50">
              {products.map((p) => (
                <div key={p.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{p.name}</p>
                      {p.category && <p className="text-xs text-navy-400">{p.category.name}</p>}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-navy-400">
                          Stock: <span className={cn('font-semibold', p.quantity <= 0 ? 'text-red-400' : p.quantity <= p.minStockLevel ? 'text-amber-400' : 'text-white')}>{p.quantity}</span>
                        </span>
                        <span className="text-xs text-navy-400">
                          Price: <span className="text-white font-medium">{formatCurrency(Number(p.sellingPrice))}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant={STOCK_STATUS_VARIANTS[p.stockStatus] ?? 'neutral'} size="sm" dot>
                        {getStockStatusLabel(p.stockStatus)}
                      </Badge>
                      <div className="flex gap-1">
                        <button onClick={() => setEditProduct(p)} className="p-1.5 text-navy-400 hover:text-white hover:bg-navy-600 rounded-lg transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteConfirm(p)} className="p-1.5 text-navy-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-700">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-navy-400 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-navy-400 uppercase hidden lg:table-cell">SKU</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-navy-400 uppercase">Stock</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-navy-400 uppercase hidden md:table-cell">Buy</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-navy-400 uppercase">Sell</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-navy-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-navy-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-700/50">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-navy-700/30 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-white">{p.name}</p>
                        {p.category && <p className="text-xs text-navy-400">{p.category.name}</p>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs font-mono text-navy-400">{p.sku || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn('text-sm font-semibold', p.quantity <= 0 ? 'text-red-400' : p.quantity <= p.minStockLevel ? 'text-amber-400' : 'text-white')}>
                          {p.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className="text-sm text-navy-300">{formatCurrency(Number(p.purchasePrice))}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-white">{formatCurrency(Number(p.sellingPrice))}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STOCK_STATUS_VARIANTS[p.stockStatus] ?? 'neutral'} dot>
                          {getStockStatusLabel(p.stockStatus)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditProduct(p)} className="p-1.5 text-navy-400 hover:text-white hover:bg-navy-600 rounded-lg transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteConfirm(p)} className="p-1.5 text-navy-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Product" size="lg">
        <ProductForm onSuccess={() => { setShowAddModal(false); qc.invalidateQueries({ queryKey: ['products'] }); }} />
      </Modal>

      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product" size="lg">
        {editProduct && (
          <ProductForm product={editProduct} onSuccess={() => { setEditProduct(null); qc.invalidateQueries({ queryKey: ['products'] }); }} />
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Product" size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteMutation.isPending}
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-navy-300">
          Delete <span className="font-semibold text-white">{deleteConfirm?.name}</span>? Sales history is preserved.
        </p>
      </Modal>
    </div>
  );
};
