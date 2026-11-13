import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export function useNotifications() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['notifications-count'],
    queryFn: async () => (await api.get('/notifications')).data.data,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    select: (d: { unreadCount: number }) => d.unreadCount,
  });
}
