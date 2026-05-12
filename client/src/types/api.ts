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

// ─── Address ─────────────────────────────────────────────────────────────────

export interface ApiAddress {
  id:           string;
  userId:       string;
  label:        string;
  type:         'HOME' | 'OFFICE' | 'OTHER';
  fullName:     string;
  phone:        string;
  addressLine1: string;
  addressLine2: string | null;
  district:     string;
  thana:        string;
  postalCode:   string | null;
  isDefault:    boolean;
  createdAt:    string;
  updatedAt:    string;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type ApiOrderStatus =
  | 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED'
  | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
  | 'REFUND_REQUESTED' | 'REFUNDED';

export type ApiPaymentStatus =
  | 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export type ApiPaymentMethod = 'COD' | 'SSLCOMMERZ';

export interface ApiOrderItem {
  id:                string;
  orderId:           string;
  productId:         string;
  productName:       string;
  productSku:        string;
  quantity:          number;
  unitPriceInPaisa:  number;
  totalPriceInPaisa: number;
  product?: {
    slug:   string;
    images: { url: string }[];
  };
}

export interface ApiOrderStatusHistoryEntry {
  id:        string;
  orderId:   string;
  status:    ApiOrderStatus;
  note:      string | null;
  createdAt: string;
}

export interface ApiOrder {
  id:                string;
  orderNumber:       string;
  userId:            string;
  addressId:         string | null;
  status:            ApiOrderStatus;
  paymentStatus:     ApiPaymentStatus;
  paymentMethod:     ApiPaymentMethod;
  subtotalInPaisa:   number;
  discountInPaisa:   number;
  shippingInPaisa:   number;
  totalInPaisa:      number;
  couponCode:        string | null;
  notes:             string | null;
  snapFullName:      string;
  snapPhone:         string;
  snapAddressLine1:  string;
  snapAddressLine2:  string | null;
  snapDistrict:      string;
  snapThana:         string;
  snapPostalCode:    string | null;
  createdAt:         string;
  updatedAt:         string;
  items:             ApiOrderItem[];
  statusHistory?:    ApiOrderStatusHistoryEntry[];
  payment?:          { method: ApiPaymentMethod; status: ApiPaymentStatus; amountInPaisa: number } | null;
}
