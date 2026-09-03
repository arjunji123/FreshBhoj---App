import { apiClient } from '../client';
import type {
  FaqItem,
  NotificationPreferences,
  ProfileStats,
  SupportContact,
} from '../types';

export const supportApi = {
  contact: () => apiClient.get<SupportContact>('/support/contact'),

  faqs: (category?: string) =>
    apiClient.get<FaqItem[]>('/support/faqs', { query: { category } }),

  notificationPreferences: () =>
    apiClient.get<NotificationPreferences>('/support/notification-preferences'),

  updateNotificationPreferences: (input: Partial<NotificationPreferences>) =>
    apiClient.patch<NotificationPreferences>('/support/notification-preferences', input),

  profileStats: () => apiClient.get<ProfileStats>('/support/profile-stats'),
};
