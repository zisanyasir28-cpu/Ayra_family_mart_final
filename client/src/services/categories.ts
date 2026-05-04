import { api } from '../lib/api';
import type { ApiCategory } from '../types/api';
import type { ApiSuccessResponse } from '@superstore/shared';

export async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await api.get<ApiSuccessResponse<ApiCategory[]>>('/categories');
  return res.data.data;
}

export async function fetchCategoryBySlug(slug: string): Promise<ApiCategory> {
  const res = await api.get<ApiSuccessResponse<ApiCategory>>(`/categories/${slug}`);
  return res.data.data;
}
