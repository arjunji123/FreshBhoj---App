/** Shapes returned by the FreshBhoj backend, mirroring its Nest DTOs. */

/** Every successful response is wrapped by the backend's TransformInterceptor. */
export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

export type FoodType = 'VEG' | 'VEGAN' | 'EGG' | 'NON_VEG';
export type MealSlot = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS';
export type MediaType = 'IMAGE' | 'VIDEO';
export type GoalTag =
  | 'HIGH_PROTEIN'
  | 'LOW_CALORIE'
  | 'WEIGHT_LOSS'
  | 'MUSCLE_GAIN'
  | 'HEALTHY_LIFESTYLE';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'UPI' | 'CARD' | 'WALLET' | 'COD';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type AddressLabel = 'HOME' | 'WORK' | 'OTHER';

// ── Auth / user ─────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  fullName: string | null;
  email: string | null;
  profileImage: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'PENDING_PROFILE';
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface VerifyOtpResult {
  isNewUser: boolean;
  user: UserProfile;
  tokens: AuthTokens;
}

// ── Catalog ─────────────────────────────────────────────────────────────────

export interface MealCategory {
  id: string;
  slug: string;
  name: string;
  iconUrl: string | null;
  slot: MealSlot | null;
}

export interface GoalTagOption {
  key: GoalTag;
  label: string;
  icon: string;
  description: string;
}

/**
 * Style of food (Thali, Biryani…), distinct from `MealCategory` which is a
 * time slot (Breakfast, Lunch). Drives the Home pill row and cover-flow
 * carousel.
 */
export interface Cuisine {
  id: string;
  slug: string;
  name: string;
  iconUrl: string | null;
  imageUrl: string | null;
  mealCount: number;
}

export interface ServiceableArea {
  id: string;
  city: string;
  state: string;
  locality: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
}

export interface ServiceabilityResult {
  serviceable: boolean;
  area: Pick<ServiceableArea, 'id' | 'locality' | 'city' | 'state' | 'pincode'> | null;
  nearbyAreas: Array<{ id: string; locality: string; city: string; pincode?: string }>;
  message?: string;
}

// ── Kitchens ────────────────────────────────────────────────────────────────

export interface KitchenCard {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  coverImage: string | null;
  isVerified: boolean;
  rating: number;
  ratingCount: number;
  followerCount: number;
  locality: string | null;
  city: string;
  prepTimeMins: number;
  openingHours: { opensAt: string; closesAt: string };
  isOpenNow: boolean;
  signatureDish: { id: string; name: string; image: string | null; price: number } | null;
}

export interface KitchenDetail extends KitchenCard {
  description: string | null;
  address: {
    line: string | null;
    locality: string | null;
    city: string;
    state: string;
    pincode: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  contactPhone: string | null;
  fssaiLicense: string | null;
  hygieneScore: number | null;
  counts: { meals: number; reels: number; reviews: number };
  isFollowing: boolean;
  memberSince: string;
}

export interface KitchenMedia {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  createdAt: string;
}

// ── Kitchen Stories (city-scoped, 24h) ──────────────────────────────────────

export interface StoryKitchenRef {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  isVerified: boolean;
  locality: string | null;
  isOpenNow: boolean;
}

export interface StoryMealRef {
  id: string;
  name: string;
  price: number;
  image: string | null;
  foodType: FoodType;
}

export interface StoryItem {
  id: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  durationSec: number;
  viewCount: number;
  publishedAt: string;
  expiresAt: string;
  isSeen: boolean;
  meal: StoryMealRef | null;
}

/** One rail entry — a kitchen's stories, grouped, newest-unseen first. */
export interface KitchenStoryGroup {
  kitchen: StoryKitchenRef;
  items: StoryItem[];
  storyCount: number;
  hasUnseen: boolean;
  coverImage: string | null;
}

// ── Meals ───────────────────────────────────────────────────────────────────

export interface MealNutrition {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
}

export interface MealCard {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  images: string[];
  price: number;
  mrp: number | null;
  discountPercent: number;
  foodType: FoodType;
  goalTags: GoalTag[];
  slots: MealSlot[];
  nutrition: MealNutrition;
  rating: number;
  ratingCount: number;
  prepTimeMins: number;
  isBestseller: boolean;
  isAvailable: boolean;
  isOrderable: boolean;
  isFavorite: boolean;
  category: { id: string; slug: string; name: string } | null;
  kitchen: {
    id: string;
    name: string;
    slug: string;
    isVerified: boolean;
    rating: number;
    locality: string | null;
    isOpenNow: boolean;
  };
}

/** A MealCard plus how far it is from the customer — Trending Near You. */
export interface NearbyMealCard extends MealCard {
  distanceKm: number;
  distanceLabel: string;
}

export interface CustomizationOption {
  id: string;
  name: string;
  priceDelta: number;
  isDefault: boolean;
}

export interface CustomizationGroup {
  id: string;
  name: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  options: CustomizationOption[];
}

export interface MealDetail extends Omit<MealCard, 'nutrition'> {
  nutrition: MealNutrition & {
    fiberG: number | null;
    macroSplit: { proteinPercent: number; carbsPercent: number; fatPercent: number };
  };
  servingSize: string | null;
  ingredients: string[];
  allergens: string[];
  orderCount: number;
  customizationGroups: CustomizationGroup[];
}

// ── Cart ────────────────────────────────────────────────────────────────────

export interface CartLine {
  id: string;
  quantity: number;
  specialInstructions: string | null;
  unitPrice: number;
  lineTotal: number;
  customizations: Array<{ id: string; name: string; priceDelta: number }>;
  meal: {
    id: string;
    name: string;
    image: string | null;
    basePrice: number;
    mrp: number | null;
    foodType: FoodType;
    calories: number | null;
    proteinG: number | null;
    isAvailable: boolean;
  };
}

export interface PriceBreakdown {
  itemsTotal: number;
  deliveryFee: number;
  taxes: number;
  discount: number;
  totalAmount: number;
  freeDeliveryApplied: boolean;
  amountToFreeDelivery: number;
  minOrderValue: number;
  freeDeliveryAbove: number;
}

export interface Cart {
  id: string;
  isEmpty: boolean;
  itemCount: number;
  kitchen: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    isVerified: boolean;
    prepTimeMins: number;
    isOpenNow: boolean;
  } | null;
  items: CartLine[];
  coupon: {
    code: string | null;
    title: string | null;
    discount: number;
    invalidReason: string | null;
  };
  pricing: PriceBreakdown;
  checkout: { canCheckout: boolean; blockers: string[] };
  updatedAt: string;
}

export interface Coupon {
  code: string;
  title: string;
  description: string | null;
  type: 'FLAT' | 'PERCENT';
  value: number;
  minOrderValue: number;
  maxDiscount: number | null;
  validTill: string;
  isApplicable: boolean;
  amountNeeded: number;
}

// ── Addresses ───────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  label: AddressLabel;
  customLabel: string | null;
  receiverName: string | null;
  receiverPhone: string | null;
  line1: string;
  line2: string | null;
  landmark: string | null;
  locality: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}

// ── Orders ──────────────────────────────────────────────────────────────────

export interface TrackingStep {
  status: OrderStatus;
  label: string;
  description: string;
  isDone: boolean;
  isCurrent: boolean;
  at: string | null;
}

export interface OrderCard {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  itemCount: number;
  thumbnails: string[];
  itemSummary: string;
  kitchen: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    isVerified: boolean;
    rating: number;
    contactPhone: string | null;
    locality: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  placedAt: string;
  deliveredAt: string | null;
  isActive: boolean;
  canReorder: boolean;
  isRated: boolean;
  createdAt: string;
}

export interface OrderDetail extends OrderCard {
  items: Array<{
    id: string;
    mealId: string | null;
    name: string;
    image: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    customizations: Array<{ id: string; name: string; priceDelta: number }>;
    specialInstructions: string | null;
  }>;
  pricing: {
    itemsTotal: number;
    deliveryFee: number;
    taxes: number;
    discount: number;
    totalAmount: number;
    couponCode: string | null;
  };
  address: Record<string, any>;
  orderNotes: string | null;
  slot: { type: 'NOW' | 'SCHEDULED'; scheduledFor: string | null };
  eta: {
    etaMinutes: number;
    expectedAt: string;
    minutesRemaining: number;
    rangeLabel: string;
  };
  tracking: { isCancelled: boolean; currentIndex: number; steps: TrackingStep[] };
  deliveryPartner: {
    id: string;
    name: string;
    phone: string;
    photoUrl: string | null;
    vehicleNumber: string | null;
  } | null;
  cancelReason: string | null;
  canCancel: boolean;
  support: { whatsapp: string; kitchenPhone: string | null };
}

// ── Reviews ─────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  photos: string[];
  tags: string[];
  isVerified: boolean;
  likeCount: number;
  createdAt: string;
  meal: { id: string; name: string } | null;
  author: { id: string; name: string; avatar: string | null; initials: string };
}

export interface ReviewSummary {
  average: number;
  total: number;
  distribution: Array<{ star: number; count: number; percent: number }>;
}

export interface PendingReviewPrompt {
  orderId: string;
  orderNumber: string;
  deliveredAt: string | null;
  kitchen: { id: string; name: string; logoUrl: string | null };
  highlightItem: { name: string; imageUrl: string | null; mealId: string | null } | null;
}

// ── Reels ───────────────────────────────────────────────────────────────────

export interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  hashtags: string[];
  durationSec: number;
  publishedAt: string;
  stats: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    viewsLabel: string;
    likesLabel: string;
  };
  isLiked: boolean;
  isSaved: boolean;
  kitchen: {
    id: string;
    slug: string;
    name: string;
    logoUrl: string | null;
    isVerified: boolean;
    rating: number;
    locality: string | null;
  };
  meal: {
    id: string;
    name: string;
    price: number;
    mrp: number | null;
    image: string | null;
    foodType: FoodType;
    calories: number | null;
    proteinG: number | null;
    isAvailable: boolean;
  } | null;
}

// ── Home ────────────────────────────────────────────────────────────────────

export interface HomeFeed {
  greeting: string;
  currentSlot: MealSlot;
  goalTags: GoalTagOption[];
  categories: MealCategory[];
  featuredKitchens: KitchenCard[];
  recommendedMeals: MealCard[];
  trendingReels: Reel[];
  activeOrders: OrderDetail[];
}

export interface SearchSuggestions {
  trendingSearches: string[];
  popularKitchens: Array<{
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    isVerified: boolean;
  }>;
  goalTags: GoalTagOption[];
}

// ── Support ─────────────────────────────────────────────────────────────────

export interface SupportContact {
  whatsapp: { number: string; url: string };
  email: string;
  phone: string;
  hours: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newKitchens: boolean;
  reelActivity: boolean;
  whatsappUpdates: boolean;
}

export interface ProfileStats {
  orderCount: number;
  favoriteCount: number;
  followingCount: number;
  addressCount: number;
}
