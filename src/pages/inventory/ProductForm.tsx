import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess }) => {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    sku: product?.sku ?? '',
    categoryId: product?.categoryId ?? '',
    supplierId: product?.supplierId ?? '',
    purchasePrice: product?.purchasePrice?.toString() ?? '',
    sellingPrice: product?.sellingPrice?.toString() ?? '',
    quantity: product?.quantity?.toString() ?? '0',
    minStockLevel: product?.minStockLevel?.toString() ?? '5',
    unit: product?.unit ?? 'unit',
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/inventory/categories')).data.data,
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => (await api.get('/inventory/suppliers')).data.data,
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload = {
        ...data,
        purchasePrice: parseFloat(data.purchasePrice),
        sellingPrice: parseFloat(data.sellingPrice),
        quantity: parseInt(data.quantity),
        minStockLevel: parseInt(data.minStockLevel),
        categoryId: data.categoryId || undefined,
        supplierId: data.supplierId || undefined,
      };
      if (isEdit) return api.put(`/inventory/products/${product.id}`, payload);
      return api.post('/inventory/products', payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated' : 'Product added');
      onSuccess();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Failed to save product');
    },
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const margin = form.purchasePrice && form.sellingPrice
    ? (((parseFloat(form.sellingPrice) - parseFloat(form.purchasePrice)) / parseFloat(form.purchasePrice)) * 100).toFixed(1)
    : null;

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Product name" value={form.name} onChange={set('name')} required placeholder="e.g. Samsung Galaxy A14" />
        <Input label="SKU / Product Code" value={form.sku} onChange={set('sku')} placeholder="e.g. SAM-A14-01" />
      </div>

      <Textarea label="Description (optional)" value={form.description} onChange={set('description')} rows={2} placeholder="Brief product description..." />

      <div className="grid sm:grid-cols-2 gap-4">
        <Select
          label="Category"
          value={form.categoryId}
          onChange={set('categoryId')}
          options={[
            { value: '', label: 'No category' },
            ...(categories?.map((c: { id: string; name: string }) => ({ value: c.id, label: c.name })) ?? []),
          ]}
        />
        <Select
          label="Supplier"
          value={form.supplierId}
          onChange={set('supplierId')}
          options={[
            { value: '', label: 'No supplier' },
            ...(suppliers?.map((s: { id: string; name: string }) => ({ value: s.id, label: s.name })) ?? []),
          ]}
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Input
          label="Purchase Price (₦)"
          type="number"
          value={form.purchasePrice}
          onChange={set('purchasePrice')}
          required
          min="0"
          step="0.01"
          placeholder="0"
        />
        <Input
          label="Selling Price (₦)"
          type="number"
          value={form.sellingPrice}
          onChange={set('sellingPrice')}
          required
          min="0"
          step="0.01"
          placeholder="0"
          hint={margin ? `${margin}% margin` : undefined}
        />
        <Input label="Unit" value={form.unit} onChange={set('unit')} placeholder="unit, pack, kg..." />
      </div>

      {!isEdit && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Opening Stock Quantity" type="number" value={form.quantity} onChange={set('quantity')} min="0" required />
          <Input label="Minimum Stock Level" type="number" value={form.minStockLevel} onChange={set('minStockLevel')} min="0" hint="Alert when stock falls below this" />
        </div>
      )}

      {isEdit && (
        <Input label="Minimum Stock Level (Restock Alert)" type="number" value={form.minStockLevel} onChange={set('minStockLevel')} min="0" />
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={mutation.isPending} className="flex-1">
          {isEdit ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};
