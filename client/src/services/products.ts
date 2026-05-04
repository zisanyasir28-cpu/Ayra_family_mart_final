import { api } from '../lib/api';
import type { ApiProduct, PaginatedData } from '../types/api';
import type { ApiSuccessResponse, PaginationMeta } from '@superstore/shared';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
}

export async function fetchProducts(
  params: ProductQueryParams = {},
): Promise<PaginatedData<ApiProduct>> {
  // Build query string, omitting undefined values
  const query: Record<string, string> = {};
  if (params.page     != null) query['page']       = String(params.page);
  if (params.limit    != null) query['limit']      = String(params.limit);
  if (params.sortBy)           query['sortBy']     = params.sortBy;
  if (params.categoryId)       query['categoryId'] = params.categoryId;
  if (params.search)           query['search']     = params.search;
  if (params.minPrice != null) query['minPrice']   = String(params.minPrice);
  if (params.maxPrice != null) query['maxPrice']   = String(params.maxPrice);
  if (params.inStock  != null) query['inStock']    = String(params.inStock);
  if (params.isFeatured != null) query['isFeatured'] = String(params.isFeatured);

  const res = await api.get<{
    success: true;
    data: ApiProduct[];
    meta: { pagination: PaginationMeta };
  }>('/products', { params: query });

  return { data: res.data.data, meta: res.data.meta };
}

export async function fetchFeaturedProducts(): Promise<ApiProduct[]> {
  const res = await api.get<ApiSuccessResponse<ApiProduct[]>>('/products/featured');
  return res.data.data;
}

export async function fetchProductBySlug(slug: string): Promise<ApiProduct> {
  const res = await api.get<ApiSuccessResponse<ApiProduct>>(`/products/${slug}`);
  return res.data.data;
}
