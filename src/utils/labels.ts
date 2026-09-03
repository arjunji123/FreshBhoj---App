import type { FoodType, GoalTag, MealSlot } from '@api/types';

/**
 * Display copy for domain enums.
 *
 * These live in `utils` rather than inside a feature because shared components
 * (`MealCard`, `Badge` rows) need them too — a component in `src/components`
 * importing from `src/features` would invert the dependency direction.
 */
export const GOAL_TAG_LABELS: Record<GoalTag, string> = {
  HIGH_PROTEIN: 'High Protein',
  LOW_CALORIE: 'Low Calorie',
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  HEALTHY_LIFESTYLE: 'Healthy Lifestyle',
};

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACKS: 'Healthy Snacks',
};

export const FOOD_TYPE_LABELS: Record<FoodType, string> = {
  VEG: 'Pure Veg',
  VEGAN: 'Vegan',
  EGG: 'Contains Egg',
  NON_VEG: 'Non-Veg',
};
