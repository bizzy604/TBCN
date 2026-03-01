'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  couponsApi,
  ordersApi,
  productsApi,
  type CouponQuery,
  type CreateCouponInput,
  type CreateOrderInput,
  type CreateProductInput,
  type OrderQuery,
  type ProductQuery,
  type ValidateCouponInput,
} from '@/lib/api/commerce';

export const commerceKeys = {
  all: ['commerce'] as const,
  catalog: (params?: ProductQuery) => ['commerce', 'catalog', params] as const,
  productDetail: (id: string) => ['commerce', 'product', id] as const,
  adminProducts: (params?: ProductQuery) => ['commerce', 'admin', 'products', params] as const,
  myOrders: (params?: OrderQuery) => ['commerce', 'orders', 'me', params] as const,
  orderDetail: (id: string) => ['commerce', 'orders', id] as const,
  orderInvoice: (id: string) => ['commerce', 'orders', id, 'invoice'] as const,
  adminCoupons: (params?: CouponQuery) => ['commerce', 'admin', 'coupons', params] as const,
  couponAnalytics: () => ['commerce', 'admin', 'coupons', 'analytics'] as const,
};

export function useProductCatalog(params?: ProductQuery) {
  return useQuery({
    queryKey: commerceKeys.catalog(params),
    queryFn: () => productsApi.listCatalog(params),
  });
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: commerceKeys.productDetail(id),
    queryFn: () => productsApi.getCatalogProduct(id),
    enabled: Boolean(id),
  });
}

export function useAdminProducts(params?: ProductQuery) {
  return useQuery({
    queryKey: commerceKeys.adminProducts(params),
    queryFn: () => productsApi.listAdminProducts(params),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductInput) => productsApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commerce', 'admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['commerce', 'catalog'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateProductInput> }) =>
      productsApi.updateProduct(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commerceKeys.productDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['commerce', 'admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['commerce', 'catalog'] });
    },
  });
}

export function usePublishProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.publishProduct(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: commerceKeys.productDetail(id) });
      queryClient.invalidateQueries({ queryKey: ['commerce', 'admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['commerce', 'catalog'] });
    },
  });
}

export function useUnpublishProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.unpublishProduct(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: commerceKeys.productDetail(id) });
      queryClient.invalidateQueries({ queryKey: ['commerce', 'admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['commerce', 'catalog'] });
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderInput) => ordersApi.createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commerce', 'orders'] });
    },
  });
}

export function useMyOrders(params?: OrderQuery) {
  return useQuery({
    queryKey: commerceKeys.myOrders(params),
    queryFn: () => ordersApi.listMyOrders(params),
  });
}

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: commerceKeys.orderDetail(id),
    queryFn: () => ordersApi.getOrder(id),
    enabled: Boolean(id),
  });
}

export function useOrderInvoice(id: string) {
  return useQuery({
    queryKey: commerceKeys.orderInvoice(id),
    queryFn: () => ordersApi.getInvoice(id),
    enabled: Boolean(id),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.cancelOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: commerceKeys.orderDetail(id) });
      queryClient.invalidateQueries({ queryKey: ['commerce', 'orders'] });
    },
  });
}

export function useRequestOrderDownload() {
  return useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
      ordersApi.requestDownload(orderId, itemId),
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (payload: ValidateCouponInput) => couponsApi.validate(payload),
  });
}

export function useAdminCoupons(params?: CouponQuery) {
  return useQuery({
    queryKey: commerceKeys.adminCoupons(params),
    queryFn: () => couponsApi.listAdminCoupons(params),
  });
}

export function useCouponAnalytics() {
  return useQuery({
    queryKey: commerceKeys.couponAnalytics(),
    queryFn: () => couponsApi.getAnalytics(),
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCouponInput) => couponsApi.createCoupon(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commerce', 'admin', 'coupons'] });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateCouponInput> }) =>
      couponsApi.updateCoupon(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commerce', 'admin', 'coupons'] });
    },
  });
}

export function useActivateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponsApi.activateCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commerce', 'admin', 'coupons'] });
    },
  });
}

export function useDeactivateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponsApi.deactivateCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commerce', 'admin', 'coupons'] });
    },
  });
}

