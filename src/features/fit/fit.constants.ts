import type { GoalTag } from '@api/types';
import { HEALTHY_GOAL_TAGS } from '@utils/health';

/**
 * The Fit section has its own fresh-green look (forest → emerald → lime) so it
 * feels like a different "room" of the app. These are section-local tokens, the
 * same in light and dark: the hero is always a deep gradient and the macro
 * colours are chosen to read on both page backgrounds.
 */
export const FIT = {
  forest: '#0A3326',
  deep: '#0F5A42',
  emerald: '#12805C',
  lime: '#C6F432',
  mint: '#DCFCE7',
  onHero: '#FFFFFF',
  heroMuted: 'rgba(255,255,255,0.78)',
  glass: 'rgba(255,255,255,0.14)',
  glassBorder: 'rgba(255,255,255,0.22)',
} as const;

export const MACRO_COLORS = {
  kcal: '#F97316',
  protein: '#12805C',
  carbs: '#E0A800',
  fat: '#3B82F6',
} as const;

export type FitGoal = 'ALL' | 'MUSCLE_GAIN' | 'FAT_LOSS' | 'BALANCED';

export interface FitGoalOption {
  key: FitGoal;
  label: string;
  hint: string;
  tags: GoalTag[];
}

export const FIT_GOALS: FitGoalOption[] = [
  { key: 'ALL', label: 'All meals', hint: 'Everything healthy', tags: [...HEALTHY_GOAL_TAGS, 'MUSCLE_GAIN'] },
  { key: 'MUSCLE_GAIN', label: 'Build muscle', hint: 'High protein', tags: ['MUSCLE_GAIN', 'HIGH_PROTEIN'] },
  { key: 'FAT_LOSS', label: 'Lose fat', hint: 'Light and lean', tags: ['WEIGHT_LOSS', 'LOW_CALORIE'] },
  { key: 'BALANCED', label: 'Eat balanced', hint: 'Everyday healthy', tags: ['HEALTHY_LIFESTYLE'] },
];

export type Sex = 'MALE' | 'FEMALE';
export type Activity = 'LIGHT' | 'MODERATE' | 'ACTIVE';

export const ACTIVITY_OPTIONS: Array<{ key: Activity; label: string; hint: string; factor: number }> = [
  { key: 'LIGHT', label: 'Light', hint: '1-2 workouts a week', factor: 1.375 },
  { key: 'MODERATE', label: 'Regular', hint: '3-4 workouts a week', factor: 1.55 },
  { key: 'ACTIVE', label: 'Intense', hint: '5+ workouts a week', factor: 1.725 },
];

export const FIT_COPY = {
  heroTitle: 'Eat clean.',
  heroAccent: 'Train smart.',
  heroSub: 'Macro-counted meals from kitchens near you.',
  goalTitle: 'What are you aiming for?',
  proteinTitle: 'Protein champions',
  proteinSubtitle: 'The most protein per plate near you',
  lightTitle: 'Light & lean',
  lightSubtitle: 'Under 450 kcal, still filling',
  kitchensTitle: 'Bhoj Fit kitchens',
  kitchensSubtitle: 'Kitchens that cook for your goals',
  feedTitle: 'All Bhoj Fit meals',
} as const;

export const FIT_TIPS: string[] = [
  'Aim for 20-30g of protein in each main meal.',
  'Eat your protein first. It keeps you full for longer.',
  'A glass of water before a meal helps you eat just enough.',
  'Pair carbs with protein to avoid an energy crash.',
  'Sleep is when your muscles actually grow. Aim for 7+ hours.',
];
