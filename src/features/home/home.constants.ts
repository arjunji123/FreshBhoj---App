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
export const TOP_ROW_HEIGHT = 46;
export const SCROLL_THRESHOLD = 80;

export const HOME_COPY = {
  searchPlaceholder: 'Search healthy meals...',
  featuredKitchens: 'Curated Kitchens',
  featuredKitchensSubtitle: 'Hand-picked, hygiene-verified partners',
  categories: 'What are you eating?',
  feedTitle: 'Meals for you',
  feedSubtitle: 'Matched to your goals and your area',
  reelsTitle: 'Food Feed',
  reelsSubtitle: 'See it being made, then order it',
  emptyFeedTitle: 'No meals match those filters',
  emptyFeedBody: 'Try clearing a filter or two — we add new kitchens every week.',
} as const;
