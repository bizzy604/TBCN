import { api } from './client';
import type { PaymentMethod, Transaction } from './payments';

export type ProductType = 'digital' | 'course_bundle' | 'event_ticket' | 'toolkit' | 'merch';
export type OrderStatus = 'pending_payment' | 'paid' | 'cancelled' | 'refunded';
export type CouponDiscountType = 'percentage' | 'fixed';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: ProductType;
  isPublished: boolean;
  isDigital: boolean;
  price: number;
  currency: string;
  thumbnailUrl: string | null;
  downloadUrl: string | null;
  stockQuantity: number | null;
  downloadLimit: number;
  downloadExpiresDays: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  title: string;
  description: string;
  type?: ProductType;
  price: number;
  currency?: string;
  isPublished?: boolean;
  isDigital?: boolean;
  thumbnailUrl?: string;
  downloadUrl?: string;
  stockQuantity?: number;
  downloadLimit?: number;
  downloadExpiresDays?: number;
  metadata?: Record<string, unknown>;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productTitle: string;
  isDigital: boolean;
  downloadUrl: string | null;
  downloadToken: string | null;
  downloadExpiresAt: string | null;
  remainingDownloads: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  metadata: Record<string, unknown>;
  product?: Product | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  invoiceNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  transactionReference: string | null;
  currency: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  couponId: string | null;
  couponCode: string | null;
  shippingAddress: Record<string, unknown> | null;
  paidAt: string | null;
  cancelledAt: string | null;
  metadata: Record<string, unknown>;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderInvoice {
  invoiceNumber: string;
  issuedAt: string;
  paidAt: string | null;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  couponCode: string | null;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

export interface DownloadAccessResult {
  downloadUrl: string;
  securePath: string;
  remainingDownloads: number;
  expiresAt: string | null;
}

export interface CreateOrderInput {
  items: Array<{
    productId: string;
    quantity?: number;
  }>;
  paymentMethod?: PaymentMethod;
  currency?: string;
  phone?: string;
  returnPath?: string;
  shippingAddress?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  couponCode?: string;
}

export interface CreateOrderResult {
  order: Order;
  transaction: Transaction;
  checkoutUrl: string | null;
}

export interface Coupon {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  currency: string | null;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  maxTotalUses: number | null;
  maxUsesPerUser: number | null;
  usedCount: number;
  allowStacking: boolean;
  applicableUserIds: string[];
  allowedPlans: string[];
  minOrderAmount: number | null;
  deactivatedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ValidateCouponInput {
  code: string;
  amount: number;
  currency?: string;
  plan?: string;
}

export interface ValidateCouponResult {
  valid: boolean;
  message?: string;
  data?: {
    couponId: string;
    code: string;
    discountType: CouponDiscountType;
    discountValue: number;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    currency: string;
  };
}

export interface CouponAnalytics {
  summary: {
    totalCoupons: number;
    activeCoupons: number;
    totalRedemptions: number;
    totalDiscountAmount: number;
  };
  topCoupons: Array<{
    couponId: string;
    code: string;
    discountType: CouponDiscountType;
    redemptions: number;
    discountAmount: number;
    grossAmount: number;
  }>;
}

export interface CreateCouponInput {
  code: string;
  name?: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  currency?: string;
  isActive?: boolean;
  startsAt?: string;
  expiresAt?: string;
  maxTotalUses?: number;
  maxUsesPerUser?: number;
  allowStacking?: boolean;
  applicableUserIds?: string[];
  allowedPlans?: string[];
  minOrderAmount?: number;
  metadata?: Record<string, unknown>;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: ProductType;
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export interface CouponQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export const productsApi = {
  listCatalog: (params?: ProductQuery) =>
    api.getRaw<PaginatedResponse<Product>>('/products/catalog', { params }),

  getCatalogProduct: (id: string) =>
    api.get<Product>(`/products/catalog/${id}`),

  listAdminProducts: (params?: ProductQuery) =>
    api.getRaw<PaginatedResponse<Product>>('/products', { params }),

  getAdminProduct: (id: string) =>
    api.get<Product>(`/products/${id}`),

  createProduct: (payload: CreateProductInput) =>
    api.post<Product>('/products', payload),

  updateProduct: (id: string, payload: Partial<CreateProductInput>) =>
    api.patch<Product>(`/products/${id}`, payload),

  publishProduct: (id: string) =>
    api.patch<Product>(`/products/${id}/publish`),

  unpublishProduct: (id: string) =>
    api.patch<Product>(`/products/${id}/unpublish`),
};

export const ordersApi = {
  createOrder: (payload: CreateOrderInput) =>
    api.post<CreateOrderResult>('/orders', payload),

  listMyOrders: (params?: OrderQuery) =>
    api.getRaw<PaginatedResponse<Order>>('/orders/me', { params }),

  getOrder: (id: string) =>
    api.get<Order>(`/orders/${id}`),

  getInvoice: (id: string) =>
    api.get<OrderInvoice>(`/orders/${id}/invoice`),

  cancelOrder: (id: string) =>
    api.patch<Order>(`/orders/${id}/cancel`),

  requestDownload: (orderId: string, itemId: string) =>
    api.post<DownloadAccessResult>(`/orders/${orderId}/items/${itemId}/download`),
};

export const couponsApi = {
  validate: (payload: ValidateCouponInput) =>
    api.post<ValidateCouponResult>('/coupons/validate', payload),

  listAdminCoupons: (params?: CouponQuery) =>
    api.getRaw<PaginatedResponse<Coupon>>('/coupons', { params }),

  createCoupon: (payload: CreateCouponInput) =>
    api.post<Coupon>('/coupons', payload),

  updateCoupon: (id: string, payload: Partial<CreateCouponInput>) =>
    api.patch<Coupon>(`/coupons/${id}`, payload),

  activateCoupon: (id: string) =>
    api.patch<Coupon>(`/coupons/${id}/activate`),

  deactivateCoupon: (id: string) =>
    api.patch<Coupon>(`/coupons/${id}/deactivate`),

  getAnalytics: () =>
    api.get<CouponAnalytics>('/coupons/admin/analytics'),
};

