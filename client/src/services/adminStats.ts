import { api } from '@/lib/api';
import type { ApiDashboardStats } from '@/types/api';

type StatsResponse = { success: true; data: ApiDashboardStats };

export async function fetchDashboardStats(): Promise<ApiDashboardStats> {
  const r = await api.get<StatsResponse>('/admin/stats/dashboard');
  return r.data.data;
}
