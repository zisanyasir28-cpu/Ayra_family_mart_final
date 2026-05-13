import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { DEMO_MODE } from '@/lib/demoMode';
import type { ApiBulkPricePreview } from '@/types/api';
import type { BulkPriceUpdateInput, ApiSuccessResponse } from '@superstore/shared';

const demoPreview: ApiBulkPricePreview = {
  affectedCount:  3,
  sampleProducts: [
    { id: 'p-apple',   name: 'Red Apple',      oldPriceInPaisa: 18000, newPriceInPaisa: 16200 },
    { id: 'p-milk',    name: 'Fresh Milk',     oldPriceInPaisa: 6800,  newPriceInPaisa: 6120  },
    { id: 'p-nescafe', name: 'Nescafé Classic', oldPriceInPaisa: 46000, newPriceInPaisa: 41400 },
  ],
};

export async function previewBulkPriceUpdate(
  input: BulkPriceUpdateInput,
): Promise<ApiBulkPricePreview> {
  if (DEMO_MODE) {
    // Approximate the preview with the demo numbers for realism
    const factor = input.changeType === 'percentage'
      ? 1 + input.changeValue / 100
      : 1; // fixed delta — pretend
    const delta = input.changeType === 'fixed' ? Math.round(input.changeValue * 100) : 0;
    return {
      affectedCount: demoPreview.affectedCount,
      sampleProducts: demoPreview.sampleProducts.map((p) => ({
        ...p,
        newPriceInPaisa: Math.max(1, Math.round(p.oldPriceInPaisa * factor) + delta),
      })),
    };
  }

  try {
    const r = await api.post<ApiSuccessResponse<ApiBulkPricePreview>>(
      '/products/bulk-price/preview',
      input,
    );
    return r.data.data;
  } catch {
    return demoPreview;
  }
}

export async function applyBulkPriceUpdate(
  input: BulkPriceUpdateInput,
): Promise<{ affectedCount: number }> {
  if (DEMO_MODE) {
    toast.error('Demo mode — bulk price update not saved');
    return Promise.reject(new Error('Demo mode'));
  }
  const r = await api.post<ApiSuccessResponse<{ affectedCount: number }>>(
    '/products/bulk-price',
    input,
  );
  return r.data.data;
}
