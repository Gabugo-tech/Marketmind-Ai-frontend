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
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Inventory</h2>
          <p className="text-sm text-navy-400">
            {data?.pagination?.total ?? 0} products
          </p>
        </div>
        <Button size="sm" icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Search products, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'All stock' },
            { value: 'low_stock', label: 'Low stock' },
            { value: 'out_of_stock', label: 'Out of stock' },
          ]}
          className="w-40"
        />
      </div>

      {/* Products table */}
      <Card padding="none">
        {isLoading ? (
          <LoadingSpinner className="py-16" />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Package size={28} />}
            title="No products found"
            description={search ? 'Try a different search term' : 'Add your first product to get started'}
            action={!search ? <Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>Add Product</Button> : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-700">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-navy-400 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-navy-400 uppercase tracking-wider hidden sm:table-cell">SKU</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-navy-400 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-navy-400 uppercase tracking-wider hidden md:table-cell">Buy Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-navy-400 uppercase tracking-wider">Sell Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-navy-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-navy-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700/50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-navy-700/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-white">{p.name}</p>
                        {p.category && (
                          <p className="text-xs text-navy-400">{p.category.name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-xs font-mono text-navy-400">{p.sku || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={cn(
                        'text-sm font-semibold',
                        p.quantity <= 0 ? 'text-red-400' : p.quantity <= p.minStockLevel ? 'text-amber-400' : 'text-white'
                      )}>
                        {p.quantity}
                      </span>
                      <span className="text-xs text-navy-500 ml-1">{p.unit}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden md:table-cell">
                      <span className="text-sm text-navy-300">{formatCurrency(Number(p.purchasePrice))}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-medium text-white">{formatCurrency(Number(p.sellingPrice))}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={STOCK_STATUS_VARIANTS[p.stockStatus] ?? 'neutral'} dot>
                        {getStockStatusLabel(p.stockStatus)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditProduct(p)}
                          className="p-1.5 text-navy-400 hover:text-white hover:bg-navy-600 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p)}
                          className="p-1.5 text-navy-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Product Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Product" size="lg">
        <ProductForm onSuccess={() => { setShowAddModal(false); qc.invalidateQueries({ queryKey: ['products'] }); }} />
      </Modal>

      {/* Edit Product Modal */}
      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product" size="lg">
        {editProduct && (
          <ProductForm
            product={editProduct}
            onSuccess={() => { setEditProduct(null); qc.invalidateQueries({ queryKey: ['products'] }); }}
          />
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Product"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteMutation.isPending}
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}>
              Delete Product
            </Button>
          </>
        }
      >
        <p className="text-sm text-navy-300">
          Are you sure you want to delete <span className="font-semibold text-white">{deleteConfirm?.name}</span>?
          This will remove the product but preserve its sales history.
        </p>
      </Modal>
    </div>
  );
};
