import type { Cart, MealCard } from '@api/types';
import { ACTIVITY_OPTIONS, type Activity, type FitGoal, type Sex } from './fit.constants';

export interface FitProfile {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: FitGoal;
}

export interface FitTargets {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

const round5 = (n: number) => Math.round(n / 5) * 5;

/**
 * Daily targets from the Mifflin-St Jeor equation. Calories shift by goal
 * (+300 to build, -450 to cut), protein scales with body weight, fat takes 27%
 * of calories and carbs fill the rest. A reasonable starting point, not medical
 * advice.
 */
export function calcTargets(p: FitProfile): FitTargets {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'MALE' ? 5 : -161);
  const factor = ACTIVITY_OPTIONS.find((a) => a.key === p.activity)?.factor ?? 1.55;
  const tdee = base * factor;
  const adjust = p.goal === 'MUSCLE_GAIN' ? 300 : p.goal === 'FAT_LOSS' ? -450 : 0;
  const kcal = Math.max(1200, round5(tdee + adjust));
  const perKg = p.goal === 'MUSCLE_GAIN' ? 2 : p.goal === 'FAT_LOSS' ? 1.9 : 1.5;
  const proteinG = Math.round(p.weightKg * perKg);
  const fatG = Math.round((kcal * 0.27) / 9);
  const carbsG = Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4));
  return { kcal, proteinG, carbsG, fatG };
}

export interface CartNutrition {
  kcal: number;
  proteinG: number;
  /** Items with no nutrition data, so the totals are a floor, not exact. */
  unknownItems: number;
}

/** Sums calories and protein across cart lines (quantity-weighted). */
export function cartNutrition(cart: Pick<Cart, 'items'> | undefined | null): CartNutrition {
  let kcal = 0;
  let proteinG = 0;
  let unknownItems = 0;
  for (const line of cart?.items ?? []) {
    const { calories, proteinG: protein } = line.meal;
    if (calories == null && protein == null) unknownItems += 1;
    kcal += (calories ?? 0) * line.quantity;
    proteinG += (protein ?? 0) * line.quantity;
  }
  return { kcal: Math.round(kcal), proteinG: Math.round(proteinG), unknownItems };
}

/** Protein per 100 kcal: a quick "how lean is this plate" measure. */
export function proteinDensity(meal: MealCard): number | null {
  const { calories, proteinG } = meal.nutrition;
  if (!calories || proteinG == null) return null;
  return (proteinG / calories) * 100;
}

/** One-line verdict for the cart meter. */
export function cartVerdict(n: CartNutrition, targets: FitTargets | null): string {
  if (n.kcal === 0 && n.proteinG === 0) return 'Nutrition info is not available for these items.';
  const density = n.kcal > 0 ? (n.proteinG / n.kcal) * 100 : 0;
  if (targets) {
    const share = n.proteinG / targets.proteinG;
    if (share >= 0.4) return 'Strong protein hit. This order covers a big share of your day.';
    if (density >= 6) return 'Lean and protein-rich. Nice pick.';
    return 'Add a high-protein side to cover more of your target.';
  }
  if (density >= 6) return 'Lean and protein-rich. Nice pick.';
  if (density >= 4) return 'A balanced plate.';
  return 'Set a daily target to see how this fits your day.';
}
