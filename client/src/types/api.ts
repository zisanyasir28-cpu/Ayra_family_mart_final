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

// ─── Admin: Customers ────────────────────────────────────────────────────────

export interface ApiCustomer {
  id:                string;
  name:              string;
  email:             string;
  phone:             string | null;
  isActive:          boolean;
  role:              string;
  createdAt:         string;
  _count:            { orders: number };
  totalSpentInPaisa: number;
}

export interface ApiCustomerDetail extends ApiCustomer {
  orders: ApiOrder[];
}

// ─── Admin: Dashboard stats ──────────────────────────────────────────────────

export interface ApiRevenueDay {
  date:           string; // 'YYYY-MM-DD'
  revenueInPaisa: number;
  orders:         number;
}

export interface ApiDashboardMetrics {
  orders:          number;
  revenueInPaisa:  number;
  newCustomers:    number;
  avgOrderInPaisa: number;
}

export interface ApiDashboardStats {
  metrics: {
    today:     ApiDashboardMetrics;
    thisWeek:  ApiDashboardMetrics;
    thisMonth: ApiDashboardMetrics;
    allTime:   ApiDashboardMetrics;
  };
  orderStatusBreakdown: { status: ApiOrderStatus; count: number }[];
  recentOrders:         ApiOrder[];
  lowStockProducts:     { id: string; name: string; sku: string; stockQuantity: number }[];
  topSellingProducts:   { productId: string; productName: string; qtySold: number; revenueInPaisa: number }[];
  revenueByDay:         ApiRevenueDay[];
}

// ─── Admin: Coupons ──────────────────────────────────────────────────────────

export type ApiCouponStatus = 'active' | 'inactive' | 'upcoming' | 'expired' | 'exhausted';
export type ApiDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface ApiCoupon {
  id:                    string;
  code:                  string;
  description:           string | null;
  discountType:          ApiDiscountType;
  discountValue:         number;
  minOrderAmountInPaisa: number | null;
  maxDiscountInPaisa:    number | null;
  usageLimit:            number | null;
  usageCount:            number;
  perUserLimit:          number | null;
  isActive:              boolean;
  startsAt:              string;
  expiresAt:             string | null;
  createdAt:             string;
  updatedAt:             string;
  status:                ApiCouponStatus;
  usagePercent:          number | null;
}

// ─── Admin: Campaigns ────────────────────────────────────────────────────────

export type ApiCampaignTimeStatus = 'upcoming' | 'active' | 'ended';
export type ApiCampaignStatus     = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ENDED';

export interface ApiCampaign {
  id:                        string;
  name:                      string;
  slug:                      string;
  description:               string | null;
  bannerUrl:                 string | null;
  status:                    ApiCampaignStatus;
  discountType:              ApiDiscountType;
  discountValue:             number;
  startsAt:                  string;
  endsAt:                    string | null;
  createdAt:                 string;
  updatedAt:                 string;
  productCount:              number;
  timeStatus:                ApiCampaignTimeStatus;
  totalDiscountGivenInPaisa: number;
}

// ─── Admin: Bulk price preview ───────────────────────────────────────────────

export interface ApiBulkPricePreview {
  affectedCount:   number;
  sampleProducts:  {
    id:              string;
    name:            string;
    oldPriceInPaisa: number;
    newPriceInPaisa: number;
  }[];
}

// ─── User profile ────────────────────────────────────────────────────────────

export interface ApiUserProfile {
  id:              string;
  email:           string;
  name:            string;
  phone:           string | null;
  role:            string;
  avatarUrl:       string | null;
  isEmailVerified: boolean;
  createdAt:       string;
  updatedAt:       string;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface ApiReview {
  id:         string;
  productId:  string;
  userId:     string;
  rating:     number;
  comment:    string | null;
  isVerified: boolean;
  createdAt:  string;
  updatedAt:  string;
  user:       { name: string; avatarUrl: string | null };
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface ApiWishlistItem {
  id:        string;
  productId: string;
  createdAt: string;
  product:   ApiProduct;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface ApiNotification {
  id:        string;
  type:      string;
  title:     string;
  message:   string;
  isRead:    boolean;
  orderId:   string | null;
  createdAt: string;
}
