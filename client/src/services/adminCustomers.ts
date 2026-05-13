import { api } from '@/lib/api';
import type { ApiCustomer, ApiCustomerDetail, PaginatedData } from '@/types/api';

export interface AdminCustomerParams {
  page?:     number;
  limit?:    number;
  search?:   string;
  isActive?: boolean;
}

type CustomersResponse     = { success: true } & PaginatedData<ApiCustomer>;
type CustomerResponse      = { success: true; data: ApiCustomerDetail };
type BanResponse           = { success: true; data: { id: string; isActive: boolean } };

export const fetchAdminCustomers = (params: AdminCustomerParams): Promise<CustomersResponse> =>
  api
    .get<CustomersResponse>('/admin/customers', { params })
    .then((r: { data: CustomersResponse }) => r.data);

export const fetchAdminCustomerById = (id: string): Promise<ApiCustomerDetail> =>
  api
    .get<CustomerResponse>(`/admin/customers/${id}`)
    .then((r: { data: CustomerResponse }) => r.data.data);

export const banCustomer = (id: string): Promise<{ id: string; isActive: boolean }> =>
  api
    .patch<BanResponse>(`/admin/customers/${id}/ban`)
    .then((r: { data: BanResponse }) => r.data.data);

export const unbanCustomer = (id: string): Promise<{ id: string; isActive: boolean }> =>
  api
    .patch<BanResponse>(`/admin/customers/${id}/unban`)
    .then((r: { data: BanResponse }) => r.data.data);
