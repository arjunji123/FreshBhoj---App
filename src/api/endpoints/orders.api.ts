import { apiClient } from '../client';
import type { Cart, OrderCard, OrderDetail, OrderStatus, Paginated, PaymentMethod } from '../types';

export interface PlaceOrderInput {
  addressId: string;
  paymentMethod?: PaymentMethod;
  slotType?: 'NOW' | 'SCHEDULED';
  scheduledFor?: string;
  orderNotes?: string;
}

export const ordersApi = {
  place: (input: PlaceOrderInput) => apiClient.post<OrderDetail>('/customer/orders', input),

  history: (params: { page?: number; limit?: number; status?: OrderStatus[] } = {}) =>
    apiClient.get<Paginated<OrderCard>>('/customer/orders', { query: params as Record<string, unknown> }),

  active: () => apiClient.get<OrderDetail[]>('/customer/orders/active'),

  detail: (id: string) => apiClient.get<OrderDetail>(`/customer/orders/${id}`),

  /** Polled every ~15s while the tracking screen is open. */
  tracking: (id: string) =>
    apiClient.get<
      Pick<
        OrderDetail,
        | 'id'
        | 'orderNumber'
        | 'status'
        | 'statusLabel'
        | 'canCancel'
        | 'tracking'
        | 'eta'
        | 'kitchen'
        | 'deliveryPartner'
        | 'support'
      >
    >(`/customer/orders/${id}/tracking`),

  confirmPayment: (id: string, paymentRef?: string) =>
    apiClient.post<OrderDetail>(`/customer/orders/${id}/confirm-payment`, { paymentRef }),

  failPayment: (id: string) => apiClient.post<OrderDetail>(`/customer/orders/${id}/fail-payment`),

  cancel: (id: string, reason?: string) =>
    apiClient.post<OrderDetail>(`/customer/orders/${id}/cancel`, { reason }),

  reorder: (id: string) =>
    apiClient.post<{ cart: Cart; addedCount: number; skippedItems: string[] }>(
      `/customer/orders/${id}/reorder`,
    ),

  /** Development helper that walks an order through the tracking stepper. */
  simulateStatus: (id: string, status: OrderStatus) =>
    apiClient.post<OrderDetail>(`/customer/orders/${id}/simulate/${status}`),
};
