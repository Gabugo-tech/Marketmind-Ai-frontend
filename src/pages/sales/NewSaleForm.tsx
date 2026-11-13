import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
}

interface NewSaleFormProps {
  onSuccess: () => void;
}

export const NewSaleForm: React.FC<NewSaleFormProps> = ({ onSuccess }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');

  const { data: productData } = useQuery({
    queryKey: ['products-search', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '10' });
      if (search) params.set('search', search);
      return (await api.get(`/inventory/products?${params}`)).data.data;
    },
    enabled: search.length > 0,
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: Number(product.sellingPrice), discountAmount: 0 }];
    });
    setSearch('');
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== id));
    } else {
      setCart((prev) => prev.map((i) => i.product.id === id ? { ...i, quantity: qty } : i));
    }
  };

  const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity - i.discountAmount, 0);
  const saleDiscount = parseFloat(discount) || 0;
  const total = subtotal - saleDiscount;
  const profit = cart.reduce((sum, i) => sum + (i.unitPrice - Number(i.product.purchasePrice)) * i.quantity, 0) - saleDiscount;

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/sales', {
        items: cart.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discountAmount: i.discountAmount,
        })),
        paymentMethod,
        discountAmount: saleDiscount,
        customerName: customerName || undefined,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      toast.success('Sale recorded successfully! 🎉');
      onSuccess();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Failed to record sale');
    },
  });

  return (
    <div className="space-y-5">
      {/* Product search */}
      <div>
        <label className="text-sm font-medium text-navy-200 block mb-2">Add Products</label>
        <div className="relative">
          <Input
            placeholder="Search product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
          {search && productData && productData.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-navy-800 border border-navy-600 rounded-xl shadow-lg overflow-hidden">
              {productData.map((p: Product) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addToCart(p)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-navy-700 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-xs text-navy-400">
                      Stock: <span className={p.quantity <= p.minStockLevel ? 'text-amber-400' : 'text-navy-300'}>{p.quantity}</span>
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-brand-400">{formatCurrency(Number(p.sellingPrice))}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="border border-navy-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-navy-700/50">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-navy-400">Product</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-navy-400">Qty</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-navy-400 hidden sm:table-cell">Unit Price</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-navy-400">Total</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50">
              {cart.map((item) => (
                <tr key={item.product.id}>
                  <td className="px-4 py-2.5">
                    <p className="text-sm font-medium text-white">{item.product.name}</p>
                    <p className="text-xs text-navy-400">Max: {item.product.quantity}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 justify-center">
                      <button onClick={() => updateQty(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-navy-700 text-white text-sm hover:bg-navy-600 transition-colors">−</button>
                      <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.id, Math.min(item.quantity + 1, item.product.quantity))}
                        className="w-6 h-6 rounded bg-navy-700 text-white text-sm hover:bg-navy-600 transition-colors">+</button>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right hidden sm:table-cell">
                    <span className="text-sm text-navy-300">{formatCurrency(item.unitPrice)}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-sm font-semibold text-white">{formatCurrency(item.unitPrice * item.quantity)}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => updateQty(item.product.id, 0)}
                      className="p-1 text-navy-500 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {cart.length > 0 && (
        <div className="bg-navy-700/50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm text-navy-300">
            <span>Subtotal</span><span className="font-medium text-white">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-navy-300">
            <span>Discount</span>
            <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)}
              min="0" className="w-28 text-right text-sm h-7 py-0" />
          </div>
          <div className="flex justify-between text-base font-bold border-t border-navy-600 pt-2">
            <span className="text-white">Total</span>
            <span className="text-brand-400">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-xs text-navy-400">
            <span>Est. Profit</span><span className="text-brand-300">+{formatCurrency(profit)}</span>
          </div>
        </div>
      )}

      {/* Payment & customer */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Select
          label="Payment Method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          options={[
            { value: 'CASH', label: 'Cash' },
            { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
            { value: 'POS', label: 'POS' },
            { value: 'MOBILE_MONEY', label: 'Mobile Money' },
            { value: 'OTHER', label: 'Other' },
          ]}
        />
        <Input label="Customer Name (optional)" value={customerName}
          onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in customer" />
      </div>

      <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes about this sale..." />

      <Button
        type="button"
        onClick={() => mutation.mutate()}
        loading={mutation.isPending}
        disabled={cart.length === 0}
        className="w-full"
        size="lg"
      >
        Record Sale — {formatCurrency(total)}
      </Button>
    </div>
  );
};
