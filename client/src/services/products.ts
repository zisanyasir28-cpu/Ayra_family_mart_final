import { api } from '../lib/api';
import type { ApiProduct, PaginatedData } from '../types/api';
import type { ApiSuccessResponse, PaginationMeta } from '@superstore/shared';
import { takaToPaisa } from '@/lib/utils';
import { demoProducts, demoFeatured } from '../lib/demoProducts';

// ─── Public storefront ────────────────────────────────────────────────────────

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
  status?: string;
}

export async function fetchProducts(
  params: ProductQueryParams = {},
): Promise<PaginatedData<ApiProduct>> {
  const query: Record<string, string> = {};
  if (params.page       != null) query['page']       = String(params.page);
  if (params.limit      != null) query['limit']      = String(params.limit);
  if (params.sortBy)             query['sortBy']     = params.sortBy;
  if (params.categoryId)         query['categoryId'] = params.categoryId;
  if (params.search)             query['search']     = params.search;
  if (params.minPrice   != null) query['minPrice']   = String(params.minPrice);
  if (params.maxPrice   != null) query['maxPrice']   = String(params.maxPrice);
  if (params.inStock    != null) query['inStock']    = String(params.inStock);
  if (params.isFeatured != null) query['isFeatured'] = String(params.isFeatured);
  if (params.status)             query['status']     = params.status;

  try {
    const res = await api.get<{
      success: true;
      data: ApiProduct[];
      meta: { pagination: PaginationMeta };
    }>('/products', { params: query });

    if (res.data.data.length === 0) throw new Error('empty');
    return { data: res.data.data, meta: res.data.meta };
  } catch {
    // Fallback to demo data when API unavailable / empty
    const limit = params.limit ?? 12;
    return {
      data: demoProducts.slice(0, limit),
      meta: {
        pagination: {
          page: params.page ?? 1,
          limit,
          total: demoProducts.length,
          totalPages: Math.ceil(demoProducts.length / limit),
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    };
  }
}

export async function fetchFeaturedProducts(): Promise<ApiProduct[]> {
  try {
    const res = await api.get<ApiSuccessResponse<ApiProduct[]>>('/products/featured');
    if (res.data.data.length === 0) throw new Error('empty');
    return res.data.data;
  } catch {
    return demoFeatured;
  }
}

export async function fetchProductBySlug(slug: string): Promise<ApiProduct> {
  const res = await api.get<ApiSuccessResponse<ApiProduct>>(`/products/${slug}`);
  return res.data.data;
}

// ─── Admin operations ─────────────────────────────────────────────────────────

export interface AdminProductFormValues {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  unit: string;
  price: number;           // BDT taka
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  tags: string[];
  isFeatured: boolean;
  status: string;
  metaTitle?: string;
  metaDescription?: string;
  newImages: File[];
  removeImageIds: string[];
}

/** Build a FormData payload from admin form values (converts BDT → paisa). */
function buildProductFormData(values: AdminProductFormValues): FormData {
  const fd = new FormData();

  fd.append('name',              values.name);
  fd.append('slug',              values.slug);
  fd.append('description',       values.description);
  fd.append('categoryId',        values.categoryId);
  fd.append('unit',              values.unit);
  fd.append('priceInPaisa',      String(takaToPaisa(values.price)));
  if (values.comparePrice)
    fd.append('comparePriceInPaisa', String(takaToPaisa(values.comparePrice)));
  if (values.costPrice)
    fd.append('costPriceInPaisa',    String(takaToPaisa(values.costPrice)));
  fd.append('stockQuantity',     String(values.stock));
  fd.append('lowStockThreshold', String(values.lowStockThreshold));
  fd.append('sku',               values.sku);
  fd.append('isFeatured',        String(values.isFeatured));
  fd.append('status',            values.status);
  fd.append('tags',              JSON.stringify(values.tags));
  if (values.metaTitle)       fd.append('metaTitle',       values.metaTitle);
  if (values.metaDescription) fd.append('metaDescription', values.metaDescription);

  values.newImages.forEach((f) => fd.append('images', f));

  if (values.removeImageIds.length) {
    fd.append('removeImageIds', JSON.stringify(values.removeImageIds));
  }

  return fd;
}

export async function createAdminProduct(values: AdminProductFormValues): Promise<ApiProduct> {
  const res = await api.post<ApiSuccessResponse<ApiProduct>>(
    '/products',
    buildProductFormData(values),
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data.data;
}

export async function updateAdminProduct(
  id: string,
  values: AdminProductFormValues,
): Promise<ApiProduct> {
  const res = await api.patch<ApiSuccessResponse<ApiProduct>>(
    `/products/${id}`,
    buildProductFormData(values),
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data.data;
}

export async function patchProductStatus(
  id: string,
  status: string,
): Promise<ApiProduct> {
  const res = await api.patch<ApiSuccessResponse<ApiProduct>>(
    `/products/${id}`,
    { status },
  );
  return res.data.data;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function bulkPriceUpdate(data: {
  type: 'by_ids' | 'by_category' | 'all_active';
  ids?: string[];
  categoryId?: string;
  changeType: 'percentage' | 'fixed';
  changeValue: number;
}): Promise<{ affectedCount: number }> {
  const res = await api.post<ApiSuccessResponse<{ affectedCount: number }>>(
    '/products/bulk-price',
    data,
  );
  return res.data.data;
}

export async function fetchLowStockProducts(): Promise<ApiProduct[]> {
  const res = await api.get<ApiSuccessResponse<ApiProduct[]>>('/products/admin/low-stock');
  return res.data.data;
}
