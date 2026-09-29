import { apiClient } from '../client';
import type { SavedCard, UpiPaymentMethod } from '../types';

/**
 * Saved cards + UPI IDs at `/customer/payment-methods`. Cards are read/select/
 * remove only — there is no client-side gateway SDK in this app yet, so
 * nothing can actually produce the `gatewayToken` a save would need (see
 * `PaymentMethods.tsx`). UPI is fully real: add/list/select/remove all write
 * for real, no gateway involved.
 */
export const paymentMethodsApi = {
  listCards: () => apiClient.get<SavedCard[]>('/customer/payment-methods'),

  setDefaultCard: (id: string) =>
    apiClient.patch<SavedCard>(`/customer/payment-methods/${id}/default`),

  removeCard: (id: string) =>
    apiClient.delete<{ id: string }>(`/customer/payment-methods/${id}`),

  listUpi: () => apiClient.get<UpiPaymentMethod[]>('/customer/payment-methods/upi'),

  addUpi: (input: { vpa: string; label?: string; isDefault?: boolean }) =>
    apiClient.post<UpiPaymentMethod>('/customer/payment-methods/upi', input),

  setDefaultUpi: (id: string) =>
    apiClient.patch<UpiPaymentMethod>(`/customer/payment-methods/upi/${id}/default`),

  removeUpi: (id: string) =>
    apiClient.delete<{ id: string }>(`/customer/payment-methods/upi/${id}`),
};
