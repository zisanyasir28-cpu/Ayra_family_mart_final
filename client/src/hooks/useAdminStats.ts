import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/services/adminStats';

export function useAdminStats() {
  return useQuery({
    queryKey:       ['admin-stats'],
    queryFn:        fetchDashboardStats,
    refetchInterval: 60_000,
    staleTime:       30_000,
  });
}
