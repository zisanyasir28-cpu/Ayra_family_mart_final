import { api } from '@/lib/api';
import type { ApiBulkPricePreview } from '@/types/api';
import type { BulkPriceUpdateInput, ApiSuccessResponse } from '@superstore/shared';

export async function previewBulkPriceUpdate(
  input: BulkPriceUpdateInput,
): Promise<ApiBulkPricePreview> {
  const r = await api.post<ApiSuccessResponse<ApiBulkPricePreview>>(
    '/products/bulk-price/preview',
    input,
  );
  return r.data.data;
}

export async function applyBulkPriceUpdate(
  input: BulkPriceUpdateInput,
): Promise<{ affectedCount: number }> {
  const r = await api.post<ApiSuccessResponse<{ affectedCount: number }>>(
    '/products/bulk-price',
    input,
  );
  return r.data.data;
}
