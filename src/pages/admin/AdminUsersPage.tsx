import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Shield, AlertTriangle, X, Ban, CheckCircle2, Trash2
} from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, EmptyState } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAdminThemeStore } from '@/store/adminTheme.store';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  isSuspended: boolean;
  suspendedReason?: string | null;
  suspendedAt?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
  _count?: { businesses: number };
}

// ── Suspension confirmation modal ─────────────────────────────────────────────
const SuspendModal: React.FC<{
  user: AdminUser;
  isDark: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ user, isDark, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState('');
  const surface = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textPrim = isDark ? 'text-white' : 'text-slate-900';
  const textMut = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className={cn('relative w-full max-w-md rounded-2xl border p-6 shadow-xl animate-slide-up', surface)}>
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center shrink-0">
              <Ban size={18} className="text-red-400" />
            </div>
            <div>
              <h3 className={cn('text-base font-bold', textPrim)}>Suspend Account</h3>
              <p className={cn('text-xs mt-0.5', textMut)}>
                {user.firstName} {user.lastName} — {user.email}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className={cn('p-1.5 rounded-lg transition-colors', textMut, 'hover:text-red-400')}>
            <X size={16} />
          </button>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-5">
          <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-300">
            This user will be immediately logged out and blocked from signing in.
            They will see your suspension reason and instructions to contact support.
          </p>
        </div>

        {/* Reason input */}
        <div className="mb-5">
          <label className={cn('block text-sm font-medium mb-1.5', textPrim)}>
            Suspension reason <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Violation of terms of service — fraudulent activity detected"
            rows={3}
            className={cn(
              'w-full rounded-xl px-4 py-3 text-sm resize-none',
              'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
              'transition-all border',
              isDark
                ? 'bg-slate-900 border-slate-600 text-slate-100 placeholder-slate-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
            )}
          />
          <p className={cn('text-[11px] mt-1', textMut)}>
            This reason will be shown to the user when they try to log in.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors touch-manipulation',
              isDark
                ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            Cancel
          </button>
          <Button
            variant="danger"
            loading={loading}
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
            className="flex-1"
          >
            Suspend Account
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Delete confirmation modal ─────────────────────────────────────────────────
const DeleteModal: React.FC<{
  user: AdminUser;
  isDark: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ user, isDark, onConfirm, onCancel, loading }) => {
  const [confirm, setConfirm] = useState('');
  const surface = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textPrim = isDark ? 'text-white' : 'text-slate-900';
  const textMut = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = isDark
    ? 'bg-slate-900 border-slate-600 text-slate-100 placeholder-slate-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className={cn('relative w-full max-w-md rounded-2xl border p-6 shadow-xl animate-slide-up', surface)}>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center shrink-0">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <div>
              <h3 className={cn('text-base font-bold', textPrim)}>Delete Account</h3>
              <p className={cn('text-xs mt-0.5', textMut)}>{user.firstName} {user.lastName} — {user.email}</p>
            </div>
          </div>
          <button onClick={onCancel} className={cn('p-1.5 rounded-lg transition-colors', textMut, 'hover:text-red-400')}>
            <X size={16} />
          </button>
        </div>

        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-5">
          <p className="text-xs text-red-300 font-medium mb-1">⚠ This action is permanent and cannot be undone.</p>
          <p className="text-xs text-red-300">All businesses, products, sales, purchases and data for this account will be permanently deleted.</p>
        </div>

        <div className="mb-5">
          <label className={cn('block text-xs font-medium mb-1.5', textMut)}>
            Type <strong className="text-red-400">DELETE</strong> to confirm
          </label>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
            className={cn(
              'w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-red-500',
              inputCls
            )}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors touch-manipulation',
              isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >Cancel</button>
          <Button
            variant="danger"
            loading={loading}
            disabled={confirm !== 'DELETE'}
            onClick={onConfirm}
            className="flex-1"
          >
            Delete Permanently
          </Button>
        </div>
      </div>
    </div>
  );
};
const UnsuspendModal: React.FC<{
  user: AdminUser;
  isDark: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ user, isDark, onConfirm, onCancel, loading }) => {
  const surface = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textPrim = isDark ? 'text-white' : 'text-slate-900';
  const textMut = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className={cn('relative w-full max-w-sm rounded-2xl border p-6 shadow-xl animate-slide-up', surface)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className={cn('text-base font-bold', textPrim)}>Lift Suspension</h3>
            <p className={cn('text-xs', textMut)}>
              {user.firstName} {user.lastName}
            </p>
          </div>
        </div>
        <p className={cn('text-sm mb-5', textMut)}>
          This user will be able to log in again. Their account will be fully restored.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors touch-manipulation',
              isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            Cancel
          </button>
          <Button
            loading={loading}
            onClick={onConfirm}
            className="flex-1 !bg-emerald-600 hover:!bg-emerald-700 !border-emerald-700"
          >
            Restore Access
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const AdminUsersPage: React.FC = () => {
  const qc = useQueryClient();
  const { isDark } = useAdminThemeStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [unsuspendTarget, setUnsuspendTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  // Theme helpers
  const surface  = isDark ? '!bg-slate-900 !border-slate-700' : '!bg-white !border-slate-200';
  const textPrim = isDark ? 'text-white' : 'text-slate-900';
  const textMut  = isDark ? 'text-slate-400' : 'text-slate-500';
  const tableRow = isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50';
  const divider  = isDark ? 'divide-slate-700/50' : 'divide-slate-100';
  const thColor  = isDark ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-200';
  const tbDivide = isDark ? 'divide-slate-800' : 'divide-slate-100';
  const paginBg  = isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200';
  const paginBorder = isDark ? 'border-slate-700' : 'border-slate-200';

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: async () =>
      (await adminApi.get(`/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`)).data.data,
    placeholderData: (prev) => prev,
  });

  const suspendMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminApi.post(`/users/${userId}/suspend`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setSuspendTarget(null);
      toast.success('Account suspended');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to suspend'),
  });

  const unsuspendMutation = useMutation({
    mutationFn: (userId: string) => adminApi.post(`/users/${userId}/unsuspend`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setUnsuspendTarget(null);
      toast.success('Account restored');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to unsuspend'),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminApi.delete(`/users/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setDeleteTarget(null);
      toast.success('Account permanently deleted');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to delete'),
  });

  const users: AdminUser[] = data?.users ?? [];

  const statusBadge = (u: AdminUser) => {
    if (u.isSuspended) return <Badge variant="danger" size="sm" dot>Suspended</Badge>;
    if (u.isActive) return <Badge variant="success" size="sm" dot>Active</Badge>;
    return <Badge variant="neutral" size="sm" dot>Inactive</Badge>;
  };

  const ActionButtons = ({ u }: { u: AdminUser }) => {
    if (u.role === 'ADMIN') return null;
    return (
      <div className="flex items-center gap-1">
        {u.isSuspended ? (
          // Suspended: show Restore + Delete
          <>
            <button
              onClick={() => setUnsuspendTarget(u)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors touch-manipulation"
              title="Lift suspension"
            >
              <CheckCircle2 size={15} />
            </button>
            <button
              onClick={() => setDeleteTarget(u)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors touch-manipulation"
              title="Delete account permanently"
            >
              <Trash2 size={15} />
            </button>
          </>
        ) : (
          // Active: show Suspend + Delete
          <>
            <button
              onClick={() => setSuspendTarget(u)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors touch-manipulation"
              title="Suspend account"
            >
              <Ban size={15} />
            </button>
            <button
              onClick={() => setDeleteTarget(u)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors touch-manipulation"
              title="Delete account permanently"
            >
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className={cn('text-lg font-bold', textPrim)}>Users</h2>
          <p className={cn('text-sm', textMut)}>{data?.total ?? 0} registered accounts</p>
        </div>
      </div>

      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        leftIcon={<Search size={16} />}
      />

      <Card padding="none" className={surface}>
        {isLoading ? (
          <LoadingSpinner className="py-16" />
        ) : users.length === 0 ? (
          <EmptyState icon={<Search size={24} />} title="No users found" />
        ) : (
          <>
            {/* Mobile card list */}
            <div className={cn('sm:hidden divide-y', divider)}>
              {users.map((u) => (
                <div key={u.id} className="px-4 py-3.5 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={cn('text-sm font-medium truncate', textPrim)}>
                        {u.firstName} {u.lastName}
                      </p>
                      {u.role === 'ADMIN' && <Shield size={12} className="text-red-400 shrink-0" />}
                    </div>
                    <p className={cn('text-xs truncate', textMut)}>{u.email}</p>
                    {u.isSuspended && u.suspendedReason && (
                      <p className="text-[10px] text-red-400 mt-0.5 truncate">
                        Suspended: {u.suspendedReason}
                      </p>
                    )}
                    <p className={cn('text-[10px] mt-0.5', textMut)}>
                      Joined {formatDate(u.createdAt, 'dd MMM yyyy')} · {u._count?.businesses ?? 0} biz
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {statusBadge(u)}
                    <ActionButtons u={u} />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={cn('border-b', thColor)}>
                    {['User', 'Email', 'Role', 'Bizs', 'Joined', 'Last Login', 'Status', 'Actions'].map((h) => (
                      <th key={h} className={cn('px-4 py-3 text-left text-[11px] font-semibold uppercase whitespace-nowrap', thColor)}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={cn('divide-y', tbDivide)}>
                  {users.map((u) => (
                    <tr key={u.id} className={cn('transition-colors', tableRow)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                            isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                          )}>
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </div>
                          <p className={cn('text-sm font-medium', textPrim)}>{u.firstName} {u.lastName}</p>
                        </div>
                        {u.isSuspended && u.suspendedReason && (
                          <p className="text-[10px] text-red-400 mt-0.5 pl-9 truncate max-w-[180px]">
                            {u.suspendedReason}
                          </p>
                        )}
                      </td>
                      <td className={cn('px-4 py-3 text-xs max-w-[180px] truncate', textMut)}>{u.email}</td>
                      <td className="px-4 py-3">
                        {u.role === 'ADMIN'
                          ? <span className="flex items-center gap-1 text-xs text-red-400"><Shield size={11} /> Admin</span>
                          : <span className={cn('text-xs', textMut)}>User</span>}
                      </td>
                      <td className={cn('px-4 py-3 text-sm', textMut)}>{u._count?.businesses ?? 0}</td>
                      <td className={cn('px-4 py-3 text-xs whitespace-nowrap', textMut)}>
                        {formatDate(u.createdAt, 'dd MMM yyyy')}
                      </td>
                      <td className={cn('px-4 py-3 text-xs whitespace-nowrap', textMut)}>
                        {u.lastLoginAt ? formatDate(u.lastLoginAt, 'dd MMM yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3">{statusBadge(u)}</td>
                      <td className="px-4 py-3"><ActionButtons u={u} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className={cn('flex items-center justify-between px-4 py-3 border-t', paginBorder)}>
                <p className={cn('text-xs', textMut)}>Page {data.page} of {data.totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={cn('px-3 py-1.5 text-xs rounded-lg disabled:opacity-40 transition-colors touch-manipulation', paginBg)}
                  >Previous</button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    className={cn('px-3 py-1.5 text-xs rounded-lg disabled:opacity-40 transition-colors touch-manipulation', paginBg)}
                  >Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modals */}
      {suspendTarget && (
        <SuspendModal
          user={suspendTarget}
          isDark={isDark}
          loading={suspendMutation.isPending}
          onConfirm={(reason) => suspendMutation.mutate({ userId: suspendTarget.id, reason })}
          onCancel={() => setSuspendTarget(null)}
        />
      )}
      {unsuspendTarget && (
        <UnsuspendModal
          user={unsuspendTarget}
          isDark={isDark}
          loading={unsuspendMutation.isPending}
          onConfirm={() => unsuspendMutation.mutate(unsuspendTarget.id)}
          onCancel={() => setUnsuspendTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          isDark={isDark}
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
