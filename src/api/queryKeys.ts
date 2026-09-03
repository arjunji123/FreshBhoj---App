/**
 * Central registry of react-query cache keys.
 *
 * Keeping them here (rather than inline strings at each call site) is what
 * makes invalidation reliable — `invalidateQueries({ queryKey: qk.cart.all })`
 * cannot silently miss a key that a screen spelled differently.
 */
export const qk = {
  home: {
    feed: ['home', 'feed'] as const,
    suggestions: ['home', 'suggestions'] as const,
  },
  catalog: {
    categories: ['catalog', 'categories'] as const,
    cuisines: ['catalog', 'cuisines'] as const,
    goalTags: ['catalog', 'goalTags'] as const,
    areas: (search?: string) => ['catalog', 'areas', search ?? ''] as const,
    serviceability: (locality?: string, pincode?: string) =>
      ['catalog', 'serviceability', locality ?? '', pincode ?? ''] as const,
  },
  meals: {
    all: ['meals'] as const,
    list: (filters: Record<string, unknown>) => ['meals', 'list', filters] as const,
    trendingNearby: (filters: Record<string, unknown>) =>
      ['meals', 'trendingNearby', filters] as const,
    detail: (id: string) => ['meals', 'detail', id] as const,
    similar: (id: string) => ['meals', 'similar', id] as const,
    favorites: ['meals', 'favorites'] as const,
    reviews: (id: string) => ['meals', id, 'reviews'] as const,
  },
  kitchens: {
    all: ['kitchens'] as const,
    list: (filters: Record<string, unknown>) => ['kitchens', 'list', filters] as const,
    detail: (idOrSlug: string) => ['kitchens', 'detail', idOrSlug] as const,
    media: (id: string) => ['kitchens', id, 'media'] as const,
    menu: (id: string) => ['kitchens', id, 'menu'] as const,
    reviews: (id: string) => ['kitchens', id, 'reviews'] as const,
    reviewSummary: (id: string) => ['kitchens', id, 'reviewSummary'] as const,
    following: ['kitchens', 'following'] as const,
  },
  cart: {
    all: ['cart'] as const,
    detail: ['cart', 'detail'] as const,
    count: ['cart', 'count'] as const,
  },
  coupons: (itemsTotal?: number) => ['coupons', itemsTotal ?? 0] as const,
  addresses: {
    all: ['addresses'] as const,
    list: ['addresses', 'list'] as const,
    default: ['addresses', 'default'] as const,
  },
  orders: {
    all: ['orders'] as const,
    history: (status?: string[]) => ['orders', 'history', status ?? []] as const,
    active: ['orders', 'active'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
    tracking: (id: string) => ['orders', 'tracking', id] as const,
  },
  reels: {
    all: ['reels'] as const,
    feed: (feed: string, kitchenId?: string) => ['reels', 'feed', feed, kitchenId ?? ''] as const,
    detail: (id: string) => ['reels', 'detail', id] as const,
    saved: ['reels', 'saved'] as const,
  },
  reviews: {
    pending: ['reviews', 'pending'] as const,
  },
  stories: {
    feed: (city?: string) => ['stories', 'feed', city ?? ''] as const,
    forKitchen: (kitchenId: string) => ['stories', 'kitchen', kitchenId] as const,
  },
  support: {
    contact: ['support', 'contact'] as const,
    faqs: (category?: string) => ['support', 'faqs', category ?? ''] as const,
    notificationPreferences: ['support', 'notificationPreferences'] as const,
    profileStats: ['support', 'profileStats'] as const,
  },
  user: {
    me: ['user', 'me'] as const,
  },
} as const;
