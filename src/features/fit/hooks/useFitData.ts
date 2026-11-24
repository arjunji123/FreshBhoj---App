import { useMemo } from 'react';
import type { MealCard } from '@api/types';
import { flattenPages, useMealFeed } from '@features/meals/hooks/useMeals';
import { FIT_GOALS } from '../fit.constants';
import type { MacroFilterState } from '../components/MacroFilters';
import type { FitGoal } from '../fit.constants';

export interface FitKitchen {
  id: string;
  name: string;
  locality: string | null;
  isVerified: boolean;
  mealCount: number;
  avgProteinG: number;
}

const POOL = 40;
const LIGHT_KCAL = 450;

const goalTags = (goal: FitGoal) => FIT_GOALS.find((g) => g.key === goal)?.tags ?? FIT_GOALS[0].tags;

/**
 * One pool of fit meals feeds the three curated rails (protein champions,
 * light & lean, fit kitchens); the main list below is a separate, filterable
 * infinite query so changing a chip never reshuffles the rails.
 */
export function useFitPool() {
  const query = useMealFeed({ goalTags: goalTags('ALL'), limit: POOL });
  const meals = useMemo(() => flattenPages(query.data?.pages).filter((m) => m.isOrderable), [query.data]);

  const proteinChampions = useMemo(
    () =>
      meals
        .filter((m) => (m.nutrition.proteinG ?? 0) >= 20)
        .sort((a, b) => (b.nutrition.proteinG ?? 0) - (a.nutrition.proteinG ?? 0))
        .slice(0, 8),
    [meals],
  );

  const lightAndLean = useMemo(
    () =>
      meals
        .filter((m) => (m.nutrition.calories ?? 0) > 0 && (m.nutrition.calories ?? 0) <= LIGHT_KCAL)
        .sort((a, b) => (b.nutrition.proteinG ?? 0) - (a.nutrition.proteinG ?? 0))
        .slice(0, 8),
    [meals],
  );

  const kitchens = useMemo<FitKitchen[]>(() => {
    const map = new Map<string, { k: MealCard['kitchen']; protein: number; count: number }>();
    for (const m of meals) {
      const entry = map.get(m.kitchen.id) ?? { k: m.kitchen, protein: 0, count: 0 };
      entry.protein += m.nutrition.proteinG ?? 0;
      entry.count += 1;
      map.set(m.kitchen.id, entry);
    }
    return [...map.values()]
      .map(({ k, protein, count }) => ({
        id: k.id,
        name: k.name,
        locality: k.locality,
        isVerified: k.isVerified,
        mealCount: count,
        avgProteinG: Math.round(protein / count),
      }))
      .sort((a, b) => b.avgProteinG - a.avgProteinG || b.mealCount - a.mealCount)
      .slice(0, 8);
  }, [meals]);

  return { proteinChampions, lightAndLean, kitchens, isLoading: query.isLoading, refetch: query.refetch };
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
