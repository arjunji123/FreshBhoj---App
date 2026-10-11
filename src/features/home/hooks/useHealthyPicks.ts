import { useMemo } from 'react';
import { flattenPages, useMealFeed } from '@features/meals/hooks/useMeals';
import { healthScore, HEALTHY_GOAL_TAGS } from '@utils/health';

const POOL_SIZE = 20;
const PICKS = 8;

/**
 * "Healthy picks for you": asks the existing meals endpoint for meals tagged
 * with any healthy goal (server-side `goalTags` hasSome filter), then ranks
 * client-side by `healthScore` (tags + protein + calories) and keeps the top few
 * orderable ones.
 */
export function useHealthyPicks() {
  const query = useMealFeed({ goalTags: HEALTHY_GOAL_TAGS, limit: POOL_SIZE });
  const meals = useMemo(
    () =>
      flattenPages(query.data?.pages)
        .filter((m) => m.isOrderable)
        .sort((a, b) => healthScore(b) - healthScore(a))
        .slice(0, PICKS),
    [query.data],
  );
  return { meals, isLoading: query.isLoading, refetch: query.refetch };
}
