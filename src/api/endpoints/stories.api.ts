import { apiClient } from '../client';
import type { KitchenStoryGroup } from '../types';

export const storiesApi = {
  /**
   * Kitchen Stories rail, scoped to the viewer's city — a Jaipur customer only
   * ever sees Jaipur kitchens. Grouped one entry per kitchen, newest-unseen
   * first; each story expires 24 hours after publishing.
   */
  feed: (city?: string) => apiClient.get<KitchenStoryGroup[]>('/stories', { query: { city } }),

  forKitchen: (kitchenId: string) =>
    apiClient.get<KitchenStoryGroup>(`/stories/kitchens/${kitchenId}`),

  markSeen: (storyId: string) =>
    apiClient.post<{ storyId: string; isSeen: boolean; recorded: boolean }>(
      `/stories/${storyId}/seen`,
    ),

  toggleLike: (storyId: string) =>
    apiClient.post<{ storyId: string; isLiked: boolean; likeCount: number }>(
      `/stories/${storyId}/like`,
    ),

  /** Fire-and-forget — called right after the native share sheet opens. */
  registerShare: (storyId: string) =>
    apiClient.post<{ storyId: string; shareCount: number }>(`/stories/${storyId}/share`),
};
