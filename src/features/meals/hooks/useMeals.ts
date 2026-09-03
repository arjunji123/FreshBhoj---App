import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mealsApi, qk } from '@api';
import type { MealListParams, TrendingNearbyParams } from '@api/endpoints/meals.api';
import type { MealCard, NearbyMealCard, Paginated } from '@api/types';

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
  return useQuery({ queryKey: qk.meals.favorites, queryFn: () => mealsApi.favorites() });
}

/**
 * Optimistic favourite toggle — the heart has to fill instantly, and a failure
 * simply reverts the flag rather than showing an error the user can't act on.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mealId: string) => mealsApi.toggleFavorite(mealId),
    onMutate: async (mealId) => {
      await queryClient.cancelQueries({ queryKey: qk.meals.detail(mealId) });
      const previous = queryClient.getQueryData(qk.meals.detail(mealId));

      queryClient.setQueryData(qk.meals.detail(mealId), (old: any) =>
        old ? { ...old, isFavorite: !old.isFavorite } : old,
      );

      return { previous, mealId };
    },
    onError: (_error, _mealId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.meals.detail(context.mealId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.meals.all });
      queryClient.invalidateQueries({ queryKey: qk.home.feed });
    },
  });
}
