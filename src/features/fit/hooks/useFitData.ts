import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mealsApi, qk } from '@api';
import type { FitOverview } from '@api/endpoints/meals.api';
import type { MealCard } from '@api/types';
import { flattenPages, useMealFeed } from '@features/meals/hooks/useMeals';
import { FIT_GOALS } from '../fit.constants';
import type { MacroFilterState } from '../components/MacroFilters';
import type { FitGoal } from '../fit.constants';

export type FitKitchen = FitOverview['kitchens'][number];

const goalTags = (goal: FitGoal) => FIT_GOALS.find((g) => g.key === goal)?.tags ?? FIT_GOALS[0].tags;

/**
 * The three curated rails (protein champions, light & lean, fit kitchens) come
 * from one server call, ranked by protein on the backend, so the tab needs a
 * single request instead of downloading a pool and sorting it on the phone.
 * The main list below is a separate filterable infinite query, so changing a
 * chip never reshuffles the rails.
 */
export function useFitPool() {
  const query = useQuery({
    queryKey: qk.meals.fit,
    queryFn: () => mealsApi.fit({ limit: 8 }),
    staleTime: 2 * 60_000,
  });
  return {
    proteinChampions: query.data?.proteinChampions ?? [],
    lightAndLean: query.data?.lightAndLean ?? [],
    kitchens: (query.data?.kitchens ?? []) as FitKitchen[],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

/** The filterable "all fit meals" list. */
export function useFitFeed(goal: FitGoal, filters: MacroFilterState) {
  const params = useMemo(
    () => ({
      goalTags: goalTags(goal),
      minProtein: filters.highProtein ? 30 : undefined,
      maxCalories: filters.lowCal ? 400 : undefined,
      foodTypes: filters.vegOnly ? (['VEG', 'VEGAN'] as MealCard['foodType'][]) : undefined,
      openOnly: filters.openNow ? true : undefined,
    }),
    [goal, filters],
  );
  const query = useMealFeed(params);
  return { query, meals: flattenPages(query.data?.pages) };
}
