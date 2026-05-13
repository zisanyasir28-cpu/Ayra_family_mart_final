import { api } from '@/lib/api';
import type { ApiCustomer, ApiCustomerDetail, PaginatedData } from '@/types/api';
import { demoCustomers, demoCustomerDetail } from '@/lib/demoData';

export interface AdminCustomerParams {
  page?:     number;
  limit?:    number;
  search?:   string;
  isActive?: boolean;
}

type CustomersResponse     = { success: true } & PaginatedData<ApiCustomer>;
type CustomerResponse      = { success: true; data: ApiCustomerDetail };
type BanResponse           = { success: true; data: { id: string; isActive: boolean } };

export async function fetchAdminCustomers(params: AdminCustomerParams): Promise<CustomersResponse> {
  try {
    const r = await api.get<CustomersResponse>('/admin/customers', { params });
    return r.data;
  } catch {
    const limit = params.limit ?? 20;
    return {
      success: true,
      data: demoCustomers,
      meta: { pagination: { page: 1, limit, total: demoCustomers.length, totalPages: 1, hasNextPage: false, hasPrevPage: false } },
    };
  }
}

export async function fetchAdminCustomerById(id: string): Promise<ApiCustomerDetail> {
  try {
    const r = await api.get<CustomerResponse>(`/admin/customers/${id}`);
    return r.data.data;
  } catch {
    return demoCustomerDetail;
  }
}

export const banCustomer = (id: string): Promise<{ id: string; isActive: boolean }> =>
  api
    .patch<BanResponse>(`/admin/customers/${id}/ban`)
    .then((r: { data: BanResponse }) => r.data.data);

export const unbanCustomer = (id: string): Promise<{ id: string; isActive: boolean }> =>
  api
    .patch<BanResponse>(`/admin/customers/${id}/unban`)
    .then((r: { data: BanResponse }) => r.data.data);
