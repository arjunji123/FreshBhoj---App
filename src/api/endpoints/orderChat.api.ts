import { apiClient } from '../client';
import type { OrderChatMessage } from '../types';

/** Customer side of the per-order chat with the kitchen preparing it. */
export const orderChatApi = {
  /** Opening the thread also marks the kitchen's unread messages read. */
  list: (orderId: string) => apiClient.get<OrderChatMessage[]>(`/customer/orders/${orderId}/messages`),

  send: (orderId: string, body: string) =>
    apiClient.post<OrderChatMessage>(`/customer/orders/${orderId}/messages`, { body }),
};
