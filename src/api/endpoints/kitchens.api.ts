import { apiClient } from '../client';
import type {
  KitchenCard,
  KitchenDetail,
  KitchenMedia,
  MealCard,
  Paginated,
  Review,
  ReviewSummary,
} from '../types';

export interface KitchenListParams {
  page?: number;
  limit?: number;
  q?: string;
  city?: string;
  locality?: string;
  verifiedOnly?: boolean;
  openOnly?: boolean;
  sortBy?: 'recommended' | 'rating' | 'newest' | 'popular';
}

export const kitchensApi = {
  list: (params: KitchenListParams = {}) =>
    apiClient.get<Paginated<KitchenCard>>('/kitchens', {
      query: params as Record<string, unknown>,
    }),

  detail: (idOrSlug: string) => apiClient.get<KitchenDetail>(`/kitchens/${idOrSlug}`),

  media: (id: string) => apiClient.get<KitchenMedia[]>(`/kitchens/${id}/media`),

  menu: (id: string, params: { page?: number; limit?: number } = {}) =>
    apiClient.get<Paginated<MealCard>>(`/kitchens/${id}/menu`, { query: params }),

  reviews: (id: string, params: { page?: number; limit?: number; sortBy?: string } = {}) =>
    apiClient.get<Paginated<Review>>(`/kitchens/${id}/reviews`, { query: params }),

  reviewSummary: (id: string) => apiClient.get<ReviewSummary>(`/kitchens/${id}/reviews/summary`),

  toggleFollow: (id: string) =>
    apiClient.post<{ kitchenId: string; isFollowing: boolean; followerCount: number }>(
      `/kitchens/${id}/follow`,
    ),

  following: (params: { page?: number; limit?: number } = {}) =>
    apiClient.get<Paginated<KitchenCard>>('/kitchens/following', { query: params }),
};
