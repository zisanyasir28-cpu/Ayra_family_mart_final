import {
  UserRole,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ProductStatus,
  DiscountType,
  CampaignStatus,
  AddressType,
} from '../constants/enums';
import type { ErrorCode } from '../constants';

// ─── API Response Envelopes ───────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: { pagination?: PaginationMeta };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── JWT Payload ──────────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub: string;       // user ID
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenFamily: string;
  iat?: number;
  exp?: number;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  createdAt: string;
}

// ─── Address ─────────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  userId: string;
  label: string;
  type: AddressType;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  district: string;
  thana: string;
  postalCode: string | null;
  isDefault: boolean;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  url: string;
  publicId: string;
  altText: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  barcode: string | null;
  priceInPaisa: number;
  comparePriceInPaisa: number | null;
  costPriceInPaisa: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  unit: string;
  weight: number | null;
  status: ProductStatus;
  categoryId: string;
  brandId: string | null;
  images: ProductImage[];
  tags: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  quantity: number;
  priceInPaisa: number;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'images' | 'stockQuantity' | 'unit'>;
}

export interface Cart {
  items: CartItem[];
  subtotalInPaisa: number;
  discountInPaisa: number;
  shippingInPaisa: number;
  totalInPaisa: number;
  couponCode: string | null;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPriceInPaisa: number;
  totalPriceInPaisa: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  shippingAddress: Omit<Address, 'id' | 'userId' | 'isDefault'>;
  subtotalInPaisa: number;
  discountInPaisa: number;
  shippingInPaisa: number;
  totalInPaisa: number;
  couponCode: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Coupon ───────────────────────────────────────────────────────────────────

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmountInPaisa: number | null;
  maxDiscountInPaisa: number | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  startsAt: string;
  expiresAt: string | null;
}

// ─── Campaign ─────────────────────────────────────────────────────────────────

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bannerUrl: string | null;
  status: CampaignStatus;
  discountType: DiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string | null;
}
