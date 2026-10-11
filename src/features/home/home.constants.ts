// Enum copy is shared with components outside this feature.
export { GOAL_TAG_LABELS, MEAL_SLOT_LABELS } from '@utils/labels';

/** Fallback icon per category slug, used when the API row has no iconUrl. */
export const CATEGORY_EMOJI: Record<string, string> = {
  breakfast: '🌅',
  lunch: '🍛',
  dinner: '🌙',
  'healthy-snacks': '🥗',
};

// ── Home header animation ───────────────────────────────────────────────────
/** Height the greeting/location row collapses from as the page scrolls. */
export const TOP_ROW_HEIGHT = 64;
export const SCROLL_THRESHOLD = 80;

export const HOME_COPY = {
  searchPlaceholder: 'Search healthy meals...',
  featuredKitchens: 'Newly Joined Kitchens',
  featuredKitchensSubtitle: 'The newest verified partners near you',
  categories: 'What are you eating?',
  feedTitle: 'Meals for you',
  feedSubtitle: 'Matched to your goals and your area',
  reelsTitle: 'Watch & Order',
  reelsSubtitle: 'See it being made, then order it',
  goalTitle: 'Eat your goal',
  goalSubtitle: 'Pick what you are training for',
  healthyTitle: 'Healthy picks for you',
  healthySubtitle: 'High protein, lighter on calories',
  bannerTitle: 'Eat fresh. Feel great.',
  emptyFeedTitle: 'No meals match those filters',
  emptyFeedBody: 'Try clearing a filter or two — we add new kitchens every week.',
} as const;

/** Search-pill hints, cross-faded every few seconds. */
export const SEARCH_HINTS: string[] = [
  'Search dal, protein bowls…',
  'Try “high protein lunch”…',
  'Search a kitchen or a dish…',
  'Light dinners under 500 kcal…',
];
export const SEARCH_HINT_INTERVAL_MS = 3000;

/** Rotating one-liners for the Home health banner. */
export const HEALTH_TIPS: string[] = [
  'Protein at every meal keeps you full for longer.',
  'Half your plate vegetables makes every meal lighter.',
  'Drink a glass of water before you eat.',
  'Home-cooked meals usually carry less oil and salt.',
  'Eat slowly - your body needs 20 minutes to feel full.',
  'Swap fried snacks for roasted or sprouted ones.',
];
