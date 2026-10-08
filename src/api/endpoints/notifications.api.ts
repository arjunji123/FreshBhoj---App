import { apiClient } from '../client';
import type { CustomerNotificationCategory, NotificationInbox } from '../types';

/** The customer notification inbox — derived server-side from orders, kitchen chat, wallet and subscriptions. */
export const notificationsApi = {
  inbox: (params: { page?: number; limit?: number; category?: CustomerNotificationCategory } = {}) =>
    apiClient.get<NotificationInbox>('/customer/notifications', {
      query: params as Record<string, unknown>,
    }),

  unreadCount: () => apiClient.get<{ unreadCount: number }>('/customer/notifications/unread-count'),

  /** Marks everything currently in the inbox as read. */
  markAllRead: () => apiClient.post<{ readAt: string }>('/customer/notifications/read-all'),
};
