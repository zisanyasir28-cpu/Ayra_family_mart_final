import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { DEMO_MODE } from '@/lib/demoMode';
import { demoCampaigns } from '@/lib/demoData';
import type { ApiCampaign, PaginatedData } from '@/types/api';
import type { CreateCampaignInput, UpdateCampaignInput, PaginationMeta } from '@superstore/shared';

export interface AdminCampaignsParams {
  page?:   number;
  limit?:  number;
  status?: 'all' | 'active' | 'upcoming' | 'ended';
}

type CampaignsResponse = { success: true } & PaginatedData<ApiCampaign>;
type CampaignResponse  = { success: true; data: ApiCampaign };

function filterDemoCampaigns(params: AdminCampaignsParams): ApiCampaign[] {
  if (!params.status || params.status === 'all') return demoCampaigns;
  return demoCampaigns.filter((c) => c.timeStatus === params.status);
}

export async function fetchAdminCampaigns(params: AdminCampaignsParams): Promise<CampaignsResponse> {
  if (DEMO_MODE) {
    const filtered = filterDemoCampaigns(params);
    const limit = params.limit ?? 20;
    return {
      success: true,
      data:    filtered,
      meta:    {
        pagination: {
          page:        params.page ?? 1,
          limit,
          total:       filtered.length,
          totalPages:  1,
          hasNextPage: false,
          hasPrevPage: false,
        } satisfies PaginationMeta,
      },
    };
  }

  try {
    const r = await api.get<CampaignsResponse>('/campaigns', { params });
    return r.data;
  } catch {
    const filtered = filterDemoCampaigns(params);
    const limit = params.limit ?? 20;
    return {
      success: true,
      data:    filtered,
      meta:    {
        pagination: {
          page:        params.page ?? 1,
          limit,
          total:       filtered.length,
          totalPages:  1,
          hasNextPage: false,
          hasPrevPage: false,
        } satisfies PaginationMeta,
      },
    };
  }
}

function demoBlocked<T>(msg = 'Demo mode — changes not saved'): Promise<T> {
  toast.error(msg);
  return Promise.reject(new Error(msg));
}

export async function createCampaign(input: CreateCampaignInput): Promise<ApiCampaign> {
  if (DEMO_MODE) return demoBlocked();
  const r = await api.post<CampaignResponse>('/campaigns', input);
  return r.data.data;
}

export async function updateCampaign(id: string, input: UpdateCampaignInput): Promise<ApiCampaign> {
  if (DEMO_MODE) return demoBlocked();
  const r = await api.patch<CampaignResponse>(`/campaigns/${id}`, input);
  return r.data.data;
}

export async function endCampaign(id: string): Promise<ApiCampaign> {
  if (DEMO_MODE) return demoBlocked();
  const r = await api.patch<CampaignResponse>(`/campaigns/${id}/end`);
  return r.data.data;
}

export async function deleteCampaign(id: string): Promise<void> {
  if (DEMO_MODE) return demoBlocked();
  await api.delete(`/campaigns/${id}`);
}
