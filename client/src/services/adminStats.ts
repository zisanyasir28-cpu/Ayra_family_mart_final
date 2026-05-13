import { api } from '@/lib/api';
import type { ApiDashboardStats } from '@/types/api';
import { demoDashboardStats } from '@/lib/demoData';

type StatsResponse = { success: true; data: ApiDashboardStats };

export async function fetchDashboardStats(): Promise<ApiDashboardStats> {
  try {
    const r = await api.get<StatsResponse>('/admin/stats/dashboard');
    return r.data.data;
  } catch {
    return demoDashboardStats;
  }
}
