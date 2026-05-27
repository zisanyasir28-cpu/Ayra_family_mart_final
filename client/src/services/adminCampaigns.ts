import { api } from '@/lib/api';
import type { ApiCampaign, PaginatedData } from '@/types/api';
import type { CreateCampaignInput, UpdateCampaignInput } from '@superstore/shared';

export interface AdminCampaignsParams {
  page?:   number;
  limit?:  number;
  status?: 'all' | 'active' | 'upcoming' | 'ended';
}

type CampaignsResponse = { success: true } & PaginatedData<ApiCampaign>;
type CampaignResponse  = { success: true; data: ApiCampaign };

export async function fetchAdminCampaigns(params: AdminCampaignsParams): Promise<CampaignsResponse> {
  const r = await api.get<CampaignsResponse>('/campaigns', { params });
  return r.data;
}

export async function createCampaign(input: CreateCampaignInput): Promise<ApiCampaign> {
  const r = await api.post<CampaignResponse>('/campaigns', input);
  return r.data.data;
}

export async function updateCampaign(id: string, input: UpdateCampaignInput): Promise<ApiCampaign> {
  const r = await api.patch<CampaignResponse>(`/campaigns/${id}`, input);
  return r.data.data;
}

export async function endCampaign(id: string): Promise<ApiCampaign> {
  const r = await api.patch<CampaignResponse>(`/campaigns/${id}/end`);
  return r.data.data;
}

export async function deleteCampaign(id: string): Promise<void> {
  await api.delete(`/campaigns/${id}`);
}
