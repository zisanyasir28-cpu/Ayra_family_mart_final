import { api } from '../lib/api';
import type { ApiCategory } from '../types/api';
import type { ApiSuccessResponse } from '@superstore/shared';

// ─── Public ───────────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await api.get<ApiSuccessResponse<ApiCategory[]>>('/categories');
  return res.data.data;
}

export async function fetchCategoryBySlug(slug: string): Promise<ApiCategory> {
  const res = await api.get<ApiSuccessResponse<ApiCategory>>(`/categories/${slug}`);
  return res.data.data;
}

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

export interface AdminCategoryFormValues {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  imageFile?: File | null;
}

export async function createAdminCategory(
  values: AdminCategoryFormValues,
): Promise<ApiCategory> {
  const fd = new FormData();
  fd.append('name',      values.name);
  fd.append('slug',      values.slug);
  if (values.description) fd.append('description', values.description);
  if (values.parentId)    fd.append('parentId',    values.parentId);
  fd.append('sortOrder', String(values.sortOrder));
  fd.append('isActive',  String(values.isActive));
  if (values.imageFile)   fd.append('image', values.imageFile);

  const res = await api.post<ApiSuccessResponse<ApiCategory>>(
    '/categories',
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data.data;
}

export async function updateAdminCategory(
  id: string,
  values: AdminCategoryFormValues,
): Promise<ApiCategory> {
  const fd = new FormData();
  fd.append('name',      values.name);
  fd.append('slug',      values.slug);
  if (values.description !== undefined) fd.append('description', values.description ?? '');
  if (values.parentId)    fd.append('parentId',    values.parentId);
  fd.append('sortOrder', String(values.sortOrder));
  fd.append('isActive',  String(values.isActive));
  if (values.imageFile)   fd.append('image', values.imageFile);

  const res = await api.patch<ApiSuccessResponse<ApiCategory>>(
    `/categories/${id}`,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data.data;
}

export async function deleteAdminCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

export async function reorderAdminCategories(
  items: Array<{ id: string; sortOrder: number }>,
): Promise<void> {
  await api.post('/categories/reorder', { items });
}
