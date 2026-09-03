import { apiClient } from '../client';
import type {
  Cuisine,
  GoalTagOption,
  MealCategory,
  ServiceabilityResult,
  ServiceableArea,
} from '../types';

export const catalogApi = {
  categories: () => apiClient.get<MealCategory[]>('/catalog/categories'),

  /** Style of food (Thali, Biryani…) — the Home pill row and cover-flow carousel. */
  cuisines: () => apiClient.get<Cuisine[]>('/catalog/cuisines'),

  goalTags: () => apiClient.get<GoalTagOption[]>('/catalog/goal-tags'),

  areas: (params: { q?: string; city?: string } = {}) =>
    apiClient.get<ServiceableArea[]>('/catalog/areas', { query: params }),

  /** Never throws for an unserviceable area — returns `serviceable: false`. */
  checkServiceability: (params: { locality?: string; pincode?: string }) =>
    apiClient.get<ServiceabilityResult>('/catalog/serviceability', { query: params }),
};
