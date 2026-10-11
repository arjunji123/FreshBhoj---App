import type { GoalTag, MealCard } from '@api/types';

/** Goal tags the backend already assigns that we treat as "healthy". */
export const HEALTHY_GOAL_TAGS: GoalTag[] = [
  'HIGH_PROTEIN',
  'LOW_CALORIE',
  'WEIGHT_LOSS',
  'HEALTHY_LIFESTYLE',
];

/**
 * Client-side health score from fields the meal API already returns (no
 * backend support exists for this). Goal tags carry most weight; protein and
 * calorie numbers refine the order. Nutrition values are nullable, so a meal
 * with no data simply scores from its tags. Heuristic, not medical advice.
 */
export function healthScore(meal: MealCard): number {
  let score = 0;
  for (const tag of meal.goalTags) if (HEALTHY_GOAL_TAGS.includes(tag)) score += 2;
  const { calories, proteinG } = meal.nutrition;
  if (typeof proteinG === 'number' && proteinG >= 20) score += 2;
  else if (typeof proteinG === 'number' && proteinG >= 12) score += 1;
  if (typeof calories === 'number' && calories > 0 && calories <= 450) score += 2;
  else if (typeof calories === 'number' && calories > 0 && calories <= 600) score += 1;
  if (meal.foodType === 'VEGAN') score += 1;
  return score;
}

/** True when a card deserves the small "Healthy pick" marker. */
export function isHealthyMeal(meal: MealCard): boolean {
  return healthScore(meal) >= 4;
}
