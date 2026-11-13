import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

interface PurchaseItem { product: Product; quantity: number; unitCost: number; }

export const NewPurchaseForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [notes, setNotes] = useState('');
  const [supplierName, setSupplierName] = useState('');

  const { data: productData } = useQuery({
    queryKey: ['products-search-purchase', search],
    queryFn: async () => (await api.get(`/inventory/products?search=${search}&limit=8`)).data.data,
    enabled: search.length > 0,
  });

  const addItem = (product: Product) => {
    setItems((prev) => {
      const e = prev.find((i) => i.product.id === product.id);
      if (e) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1, unitCost: Number(product.purchasePrice) }];
    });
    setSearch('');
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.product.id !== id));
  const updateItem = (id: string, field: 'quantity' | 'unitCost', value: number) =>
    setItems((prev) => prev.map((i) => i.product.id === id ? { ...i, [field]: value } : i));

  const total = items.reduce((s, i) => s + i.unitCost * i.quantity, 0);

  const mutation = useMutation({
    mutationFn: () => api.post('/purchases', {
      items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity, unitCost: i.unitCost })),
      supplierName: supplierName || undefined,
      paymentMethod, paymentStatus, notes: notes || undefined,
    }),
    onSuccess: () => { toast.success('Purchase recorded — stock updated!'); onSuccess(); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Failed to record purchase'),
  });

  return (
    <div className="space-y-5">
      <div className="relative">
        <Input placeholder="Search product to restock..." value={search}
          onChange={(e) => setSearch(e.target.value)} leftIcon={<Search size={16} />} label="Add Products" />
        {search && productData?.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-navy-800 border border-navy-600 rounded-xl shadow-lg overflow-hidden">
            {productData.map((p: Product) => (
              <button key={p.id} type="button" onClick={() => addItem(p)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-navy-700 transition-colors text-left">
                <div>
                  <p className="text-sm font-medium text-white">{p.name}</p>
                  <p className="text-xs text-navy-400">Current stock: {p.quantity}</p>
                </div>
                <span className="text-xs text-navy-300">Last cost: {formatCurrency(Number(p.purchasePrice))}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="border border-navy-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-navy-700/50">
              <th className="px-4 py-2 text-left text-xs text-navy-400">Product</th>
              <th className="px-3 py-2 text-center text-xs text-navy-400">Qty</th>
              <th className="px-3 py-2 text-right text-xs text-navy-400">Unit Cost (₦)</th>
              <th className="px-3 py-2 text-right text-xs text-navy-400">Total</th>
              <th className="px-3 py-2" />
            </tr></thead>
            <tbody className="divide-y divide-navy-700/50">
              {items.map((item) => (
                <tr key={item.product.id}>
                  <td className="px-4 py-2.5"><p className="text-sm text-white">{item.product.name}</p></td>
                  <td className="px-3 py-2.5">
                    <input type="number" min="1" value={item.quantity}
                      onChange={(e) => updateItem(item.product.id, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-16 bg-navy-700 border border-navy-600 text-white text-sm text-center rounded-lg px-2 py-1 focus:outline-none focus:border-brand-500" />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <input type="number" min="0" value={item.unitCost}
                      onChange={(e) => updateItem(item.product.id, 'unitCost', parseFloat(e.target.value) || 0)}
                      className="w-24 bg-navy-700 border border-navy-600 text-white text-sm text-right rounded-lg px-2 py-1 focus:outline-none focus:border-brand-500" />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-sm font-semibold text-white">{formatCurrency(item.unitCost * item.quantity)}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => removeItem(item.product.id)} className="p-1 text-navy-500 hover:text-red-400"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-navy-700/30 border-t border-navy-700 flex justify-between">
            <span className="text-sm text-navy-300">Total</span>
            <span className="text-sm font-bold text-brand-400">{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Supplier Name (optional)" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="e.g. Lagos Tech Wholesale" />
        <Select label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
          options={[
            { value: 'CASH', label: 'Cash' }, { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
            { value: 'POS', label: 'POS' }, { value: 'OTHER', label: 'Other' },
          ]} />
      </div>

      <Select label="Payment Status" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}
        options={[{ value: 'PAID', label: 'Fully Paid' }, { value: 'PARTIAL', label: 'Partial Payment' }, { value: 'PENDING', label: 'Pending' }]} />

      <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <Button type="button" onClick={() => mutation.mutate()} loading={mutation.isPending}
        disabled={items.length === 0} className="w-full" size="lg">
        Record Purchase — {formatCurrency(total)}
      </Button>
    </div>
  );
};
