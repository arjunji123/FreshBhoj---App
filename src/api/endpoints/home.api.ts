import { apiClient } from '../client';
import type { HomeFeed, SearchSuggestions } from '../types';

export const homeApi = {
  /** One call for everything above the Home meal feed. */
  feed: () => apiClient.get<HomeFeed>('/home/feed'),

  searchSuggestions: () => apiClient.get<SearchSuggestions>('/home/search-suggestions'),
};
