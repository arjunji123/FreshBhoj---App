import { apiClient } from '../client';
import type {
  FoodType,
  GoalTag,
  MealCard,
  MealDetail,
  MealSlot,
  NearbyMealCard,
  Paginated,
  Review,
} from '../types';

export type MealSortBy =
  | 'recommended'
  | 'rating'
  | 'price_low'
  | 'price_high'
  | 'calories_low'
  | 'protein_high'
  | 'newest';

export interface MealListParams {
  page?: number;
  limit?: number;
  q?: string;
  goalTags?: GoalTag[];
  slots?: MealSlot[];
  foodTypes?: FoodType[];
  category?: string;
  cuisine?: string;
  kitchenId?: string;
  minPrice?: number;
  maxPrice?: number;
  maxCalories?: number;
  minProtein?: number;
  openOnly?: boolean;
  sortBy?: MealSortBy;
}

export interface TrendingNearbyParams {
  lat: number;
  lng: number;
  radiusKm?: number;
  goalTags?: GoalTag[];
  cuisine?: string;
  page?: number;
  limit?: number;
}

export const mealsApi = {
  list: (params: MealListParams = {}) =>
    apiClient.get<Paginated<MealCard>>('/meals', { query: params as Record<string, unknown> }),

  /**
   * "Trending Near You" — ranked by real demand among kitchens within a
   * radius of the given coordinates. `lat`/`lng` are required by the backend;
   * pass the customer's onboarding location or their live GPS fix.
   */
  trendingNearby: (params: TrendingNearbyParams) =>
    apiClient.get<Paginated<NearbyMealCard>>('/meals/trending-nearby', {
      query: params as unknown as Record<string, unknown>,
    }),

  detail: (id: string) => apiClient.get<MealDetail>(`/meals/${id}`),

  similar: (id: string) => apiClient.get<MealCard[]>(`/meals/${id}/similar`),

  favorites: (params: { page?: number; limit?: number } = {}) =>
    apiClient.get<Paginated<MealCard>>('/meals/favorites', { query: params }),

  toggleFavorite: (id: string) =>
    apiClient.post<{ mealId: string; isFavorite: boolean }>(`/meals/${id}/favorite`),

  reviews: (id: string, params: { page?: number; limit?: number } = {}) =>
    apiClient.get<Paginated<Review>>(`/meals/${id}/reviews`, { query: params }),
};
