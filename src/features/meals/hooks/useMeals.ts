import { useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mealsApi, qk } from '@api';
import type { MealListParams, TrendingNearbyParams } from '@api/endpoints/meals.api';
import type { MealCard, NearbyMealCard, Paginated } from '@api/types';
import { useAuthStore } from '@features/authentication/store/authStore';
import { useRequireAuth } from '@features/authentication/hooks/useRequireAuth';

const PAGE_SIZE = 10;

/**
 * The infinite meal feed behind Home and Search.
 * `getNextPageParam` reads the backend's `hasNextPage` rather than guessing
 * from the array length, so a partially-filtered page doesn't stop the scroll.
 */
export function useMealFeed(filters: MealListParams = {}) {
  return useInfiniteQuery({
    queryKey: qk.meals.list(filters as Record<string, unknown>),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      mealsApi.list({ ...filters, page: pageParam as number, limit: filters.limit ?? PAGE_SIZE }),
    getNextPageParam: (lastPage: Paginated<MealCard>) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    staleTime: 60_000,
  });
}

/** Flattens the infinite pages into the single array a list needs. */
export function flattenPages<T>(pages?: Array<Paginated<T>>): T[] {
  return pages?.flatMap((page) => page.items) ?? [];
}

/**
 * "Trending Near You" — ranked by real demand within a radius of the given
 * coordinates. Disabled until a lat/lng is known, since "near you" with no
 * location is a different feature wearing the same label.
 */
export function useTrendingNearby(params: TrendingNearbyParams | null) {
  return useInfiniteQuery({
    queryKey: qk.meals.trendingNearby((params ?? {}) as Record<string, unknown>),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      mealsApi.trendingNearby({ ...(params as TrendingNearbyParams), page: pageParam as number, limit: params?.limit ?? PAGE_SIZE }),
    getNextPageParam: (lastPage: Paginated<NearbyMealCard>) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled: params !== null,
    staleTime: 2 * 60_000,
  });
}

export function useMealDetail(mealId: string) {
  return useQuery({
    queryKey: qk.meals.detail(mealId),
    queryFn: () => mealsApi.detail(mealId),
    enabled: Boolean(mealId),
  });
}

export function useSimilarMeals(mealId: string) {
  return useQuery({
    queryKey: qk.meals.similar(mealId),
    queryFn: () => mealsApi.similar(mealId),
    enabled: Boolean(mealId),
    staleTime: 5 * 60_000,
  });
}

export function useMealReviews(mealId: string, limit = 4) {
  return useQuery({
    queryKey: [...qk.meals.reviews(mealId), limit],
    queryFn: () => mealsApi.reviews(mealId, { limit }),
    enabled: Boolean(mealId),
  });
}

export function useFavorites() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: qk.meals.favorites,
    queryFn: () => mealsApi.favorites(),
    enabled: Boolean(isAuthenticated),
  });
}

/** Flips `isFavorite` wherever a meal shows up: detail, paginated lists, or infinite-query pages. */
function toggleFavoriteInCache(data: unknown, mealId: string): unknown {
  if (!data || typeof data !== 'object') return data;

  if ('pages' in data && Array.isArray((data as any).pages)) {
    return { ...data, pages: (data as any).pages.map((page: unknown) => toggleFavoriteInCache(page, mealId)) };
  }
  if ('items' in data && Array.isArray((data as any).items)) {
    return {
      ...data,
      items: (data as any).items.map((item: any) =>
        item?.id === mealId ? { ...item, isFavorite: !item.isFavorite } : item,
      ),
    };
  }
  if ((data as any).id === mealId && 'isFavorite' in data) {
    return { ...data, isFavorite: !(data as any).isFavorite };
  }
  return data;
}

/**
 * Optimistic favourite toggle. The heart lives on several independent caches
 * at once — the Home feed, Search results, Trending Near You and the
 * Favourites list all hold their own copy of the same meal — so patching only
 * `meals.detail` left every card except the detail screen stale until the
 * next refetch. This walks every `meals.*` query and flips the flag in place.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const requireAuth = useRequireAuth();

  const mutation = useMutation({
    mutationFn: (mealId: string) => mealsApi.toggleFavorite(mealId),
    onMutate: async (mealId) => {
      await queryClient.cancelQueries({ queryKey: qk.meals.all });
      const previousQueries = queryClient.getQueriesData({ queryKey: qk.meals.all });

      previousQueries.forEach(([key, data]) => {
        queryClient.setQueryData(key, toggleFavoriteInCache(data, mealId));
      });

      return { previousQueries };
    },
    onError: (_error, _mealId, context) => {
      context?.previousQueries?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.meals.all });
      queryClient.invalidateQueries({ queryKey: qk.home.feed });
    },
  });

  // A guest sees the login sheet instead of an optimistic flip that would
  // just 401 — the heart re-runs on its own once they've logged in.
  const mutate: typeof mutation.mutate = useCallback(
    (mealId, options) => requireAuth(() => mutation.mutate(mealId, options)),
    [requireAuth, mutation],
  );

  return { ...mutation, mutate };
}
