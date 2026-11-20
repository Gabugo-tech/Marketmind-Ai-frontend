import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Store } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner, EmptyState } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils';

export const AdminBusinessesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-businesses', search, page],
    queryFn: async () =>
      (await adminApi.get(`/businesses?page=${page}&limit=20&search=${encodeURIComponent(search)}`)).data.data,
    placeholderData: (prev) => prev,
  });

  const businesses: any[] = data?.businesses ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-white">Businesses</h2>
          <p className="text-sm text-slate-400">{data?.total ?? 0} registered businesses</p>
        </div>
      </div>

      <Input
        placeholder="Search by name or location..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        leftIcon={<Search size={16} />}
      />

      <Card padding="none" className="!bg-slate-900 !border-slate-700">
        {isLoading ? (
          <LoadingSpinner className="py-16" />
        ) : businesses.length === 0 ? (
          <EmptyState icon={<Store size={24} />} title="No businesses found" />
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-slate-700/50">
              {businesses.map((b) => (
                <div key={b.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{b.name}</p>
                        {b.isDemo && <Badge variant="neutral" size="sm">Demo</Badge>}
                      </div>
                      <p className="text-xs text-slate-400">{b.owner?.firstName} {b.owner?.lastName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{b.location} · {b.category?.replace(/_/g, ' ')}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                        <span>{b.productCount} products</span>
                        <span>{b.salesCount} sales</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white">{formatCurrency(b.totalRevenue)}</p>
                      <p className="text-xs text-emerald-400">+{formatCurrency(b.totalProfit)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['Business', 'Owner', 'Category', 'Location', 'Products', 'Sales', 'Revenue', 'Profit', 'Joined'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {businesses.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{b.name}</p>
                          {b.isDemo && <Badge variant="neutral" size="sm">Demo</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {b.owner?.firstName} {b.owner?.lastName}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {b.category?.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{b.location}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{b.productCount}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{b.salesCount}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-white whitespace-nowrap">
                        {formatCurrency(b.totalRevenue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-emerald-400 whitespace-nowrap">
                        +{formatCurrency(b.totalProfit)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(b.createdAt, 'dd MMM yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
                <p className="text-xs text-slate-500">Page {data.page} of {data.totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors touch-manipulation"
                  >Previous</button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors touch-manipulation"
                  >Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};
