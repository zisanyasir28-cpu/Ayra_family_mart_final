import { api } from '@/lib/api';
import type { ApiDashboardStats } from '@/types/api';

type StatsResponse = { success: true; data: ApiDashboardStats };

export const fetchDashboardStats = (): Promise<ApiDashboardStats> =>
  api
    .get<StatsResponse>('/admin/stats/dashboard')
    .then((r: { data: StatsResponse }) => r.data.data);
