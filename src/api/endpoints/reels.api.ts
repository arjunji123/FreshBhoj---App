import { apiClient } from '../client';
import type { Paginated, Reel } from '../types';

export type ReelFeedType = 'for_you' | 'following' | 'trending';

export interface ReelFeedParams {
  page?: number;
  limit?: number;
  feed?: ReelFeedType;
  kitchenId?: string;
  q?: string;
}

export const reelsApi = {
  feed: (params: ReelFeedParams = {}) =>
    apiClient.get<Paginated<Reel>>('/reels', { query: params as Record<string, unknown> }),

  detail: (id: string) => apiClient.get<Reel>(`/reels/${id}`),

  toggleLike: (id: string) =>
    apiClient.post<{ reelId: string; isLiked: boolean; likeCount: number }>(`/reels/${id}/like`),

  toggleSave: (id: string) =>
    apiClient.post<{ reelId: string; isSaved: boolean }>(`/reels/${id}/save`),

  recordView: (id: string) => apiClient.post<{ reelId: string }>(`/reels/${id}/view`),

  recordShare: (id: string) => apiClient.post<{ reelId: string }>(`/reels/${id}/share`),

  saved: (params: { page?: number; limit?: number } = {}) =>
    apiClient.get<Paginated<Reel>>('/reels/saved', { query: params }),
};
