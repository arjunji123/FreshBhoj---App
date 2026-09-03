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
};
