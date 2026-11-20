import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner, EmptyState } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export const AdminUsersPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: async () =>
      (await adminApi.get(`/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`)).data.data,
    placeholderData: (prev) => prev,
  });

  const toggleMutation = useMutation({
    mutationFn: (userId: string) => adminApi.patch(`/users/${userId}/toggle`),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      const active = res.data.data.isActive;
      toast.success(`User ${active ? 'activated' : 'deactivated'}`);
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to toggle user'),
  });

  const users: any[] = data?.users ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-white">Users</h2>
          <p className="text-sm text-slate-400">{data?.total ?? 0} registered accounts</p>
        </div>
      </div>

      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        leftIcon={<Search size={16} />}
      />

      <Card padding="none" className="!bg-slate-900 !border-slate-700">
        {isLoading ? (
          <LoadingSpinner className="py-16" />
        ) : users.length === 0 ? (
          <EmptyState icon={<Search size={24} />} title="No users found" />
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-slate-700/50">
              {users.map((u) => (
                <div key={u.id} className="px-4 py-3.5 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{u.firstName} {u.lastName}</p>
                      {u.role === 'ADMIN' && <Shield size={12} className="text-red-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Joined {formatDate(u.createdAt, 'dd MMM yyyy')} · {u._count?.businesses ?? 0} business(es)
                    </p>
                    {u.lastLoginAt && (
                      <p className="text-[10px] text-slate-600">Last login: {formatDate(u.lastLoginAt, 'dd MMM yyyy')}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant={u.isActive ? 'success' : 'danger'} size="sm" dot>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => toggleMutation.mutate(u.id)}
                        disabled={toggleMutation.isPending}
                        className={cn(
                          'p-1.5 rounded-lg transition-colors touch-manipulation text-xs',
                          u.isActive
                            ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                            : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                        )}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['User', 'Email', 'Role', 'Businesses', 'Joined', 'Last Login', 'Status', 'Action'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </div>
                          <p className="text-sm font-medium text-white">{u.firstName} {u.lastName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-[180px] truncate">{u.email}</td>
                      <td className="px-4 py-3">
                        {u.role === 'ADMIN'
                          ? <span className="flex items-center gap-1 text-xs text-red-400"><Shield size={11} /> Admin</span>
                          : <span className="text-xs text-slate-500">User</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">{u._count?.businesses ?? 0}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(u.createdAt, 'dd MMM yyyy')}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {u.lastLoginAt ? formatDate(u.lastLoginAt, 'dd MMM yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.isActive ? 'success' : 'danger'} size="sm" dot>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => toggleMutation.mutate(u.id)}
                            disabled={toggleMutation.isPending}
                            className={cn(
                              'p-1.5 rounded-lg transition-colors touch-manipulation',
                              u.isActive
                                ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                                : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                            )}
                            title={u.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
                <p className="text-xs text-slate-500">
                  Page {data.page} of {data.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors touch-manipulation"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors touch-manipulation"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};
