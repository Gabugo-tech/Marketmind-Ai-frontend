import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

export function useMe() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get('/auth/me')).data.data,
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });
}

export function useLogout() {
  const { logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api.post('/auth/logout', { refreshToken }),
    onSettled: () => {
      logout();
      navigate('/login');
    },
  });
}
