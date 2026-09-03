import { apiClient } from '../client';
import type { Cart, Coupon } from '../types';

export interface AddCartItemInput {
  mealId: string;
  quantity?: number;
  customizationIds?: string[];
  specialInstructions?: string;
  /** Set after the user confirms the "clear cart?" prompt on a kitchen conflict. */
  replaceCart?: boolean;
}

export const cartApi = {
  get: () => apiClient.get<Cart>('/customer/cart'),

  count: () => apiClient.get<{ itemCount: number; lineCount: number }>('/customer/cart/count'),

  addItem: (input: AddCartItemInput) => apiClient.post<Cart>('/customer/cart/items', input),

  updateItem: (itemId: string, input: { quantity: number; specialInstructions?: string }) =>
    apiClient.patch<Cart>(`/customer/cart/items/${itemId}`, input),

  removeItem: (itemId: string) => apiClient.delete<Cart>(`/customer/cart/items/${itemId}`),

  clear: () => apiClient.delete<Cart>('/customer/cart'),

  applyCoupon: (code: string) => apiClient.post<Cart>('/customer/cart/coupon', { code }),

  removeCoupon: () => apiClient.delete<Cart>('/customer/cart/coupon'),
};

export const couponsApi = {
  list: (itemsTotal = 0) => apiClient.get<Coupon[]>('/coupons', { query: { itemsTotal } }),
};
