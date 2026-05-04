import type { Product, ProductImage, PaginationMeta } from '@superstore/shared';

// ─── Campaign enrichment returned by the API ────────────────────────────────

export interface ActiveCampaign {
  id: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  endsAt: string | null;
}

// ─── Product as returned by GET /api/v1/products ────────────────────────────

export interface ApiProduct extends Product {
  effectivePriceInPaisa: number;
  activeCampaign: ActiveCampaign | null;
  images: ProductImage[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

// ─── Category tree node ──────────────────────────────────────────────────────

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { products: number };
  children: ApiCategory[];
}

// ─── Paginated list response helper ─────────────────────────────────────────

export interface PaginatedData<T> {
  data: T[];
  meta: { pagination: PaginationMeta };
}
