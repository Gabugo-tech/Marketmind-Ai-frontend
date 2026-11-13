import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, AlertTriangle, Package, CheckCircle, Info, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatRelative, cn } from '@/lib/utils';
import type { Notification } from '@/types';
import toast from 'react-hot-toast';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  OUT_OF_STOCK: <AlertTriangle size={16} className="text-red-400" />,
  CRITICAL_STOCK: <AlertTriangle size={16} className="text-orange-400" />,
  LOW_STOCK: <Package size={16} className="text-amber-400" />,
  RESTOCK_RECOMMENDATION: <Package size={16} className="text-brand-400" />,
  SALES_ANOMALY: <Info size={16} className="text-blue-400" />,
  SYSTEM: <Bell size={16} className="text-navy-400" />,
};

const PRIORITY_VARIANT: Record<string, 'danger' | 'warning' | 'info' | 'neutral'> = {
  URGENT: 'danger', HIGH: 'danger', MEDIUM: 'warning', LOW: 'neutral',
};

export const NotificationsPage: React.FC = () => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data.data,
    refetchInterval: 30_000,
  });

  const markReadMutation = useMutation({
    mutationFn: (ids: string[] | 'all') => api.post('/notifications/mark-read', { ids }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('Marked as read'); },
  });

  const notifications: Notification[] = data?.notifications ?? [];
  const unreadCount: number = data?.unreadCount ?? 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Alerts & Notifications
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">{unreadCount}</span>
            )}
          </h2>
          <p className="text-sm text-navy-400">Stock alerts and business intelligence notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="secondary" icon={<CheckCheck size={15} />}
            onClick={() => markReadMutation.mutate('all')} loading={markReadMutation.isPending}>
            Mark all read
          </Button>
        )}
      </div>

      <Card padding="none">
        {isLoading ? (
          <LoadingSpinner className="py-16" />
        ) : notifications.length === 0 ? (
          <EmptyState icon={<Bell size={28} />} title="No notifications" description="You'll see stock alerts and business insights here" />
        ) : (
          <div className="divide-y divide-navy-700/50">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'flex items-start gap-3 px-5 py-4 hover:bg-navy-700/30 transition-colors',
                  !n.isRead && 'bg-brand-500/5 border-l-2 border-brand-500'
                )}
              >
                <div className="mt-0.5 shrink-0">{TYPE_ICONS[n.type] ?? <Bell size={16} />}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{n.title}</p>
                    <Badge variant={PRIORITY_VARIANT[n.priority] ?? 'neutral'} size="sm">
                      {n.priority}
                    </Badge>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />}
                  </div>
                  <p className="text-sm text-navy-300 mt-0.5">{n.message}</p>
                  <p className="text-xs text-navy-500 mt-1">{formatRelative(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => markReadMutation.mutate([n.id])}
                    className="shrink-0 p-1 text-navy-500 hover:text-brand-400 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
