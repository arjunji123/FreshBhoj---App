// Mirrors the backend's kitchen-partner DTOs — kept as plain types (same
// approach as the website's lib/types.ts) since this app and the backend
// aren't code-generated together.

export type KitchenAccountStatus =
  | 'PENDING_VERIFICATION'
  | 'ONBOARDING'
  | 'UNDER_REVIEW'
  | 'ACTIVE'
  | 'REJECTED'
  | 'SUSPENDED';

export type KitchenOnboardingStep =
  | 'PHONE_VERIFIED'
  | 'OWNER_DETAILS'
  | 'KITCHEN_DETAILS'
  | 'LOCATION'
  | 'DOCUMENTS'
  | 'BANK_DETAILS'
  | 'MENU_SETUP'
  | 'SUBMITTED'
  | 'COMPLETED';

export type KitchenStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'SUSPENDED';
export type FoodType = 'VEG' | 'EGG' | 'NON_VEG' | 'VEGAN';
export type MediaType = 'IMAGE' | 'VIDEO';
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface KitchenTokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface KitchenAccount {
  id: string;
  phone: string;
  email: string | null;
  ownerName: string | null;
  status: KitchenAccountStatus;
  onboardingStep: KitchenOnboardingStep;
  rejectionReason: string | null;
}

export interface OnboardingStepState {
  step: KitchenOnboardingStep;
  label: string;
  description: string;
  isComplete: boolean;
  isCurrent: boolean;
}

export interface OnboardingStatus {
  status: KitchenAccountStatus;
  currentStep: KitchenOnboardingStep;
  progressPercent: number;
  steps: OnboardingStepState[];
  canSubmit: boolean;
  pending: string[];
  rejectionReason: string | null;
  kitchenId: string | null;
}

export interface KitchenProfile {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  coverImage: string | null;
  status: KitchenStatus;
  isVerified: boolean;
  rating: number;
  ratingCount: number;
  followerCount: number;
  city: string;
  prepTimeMins: number;
  opensAt: string;
  closesAt: string;
  isAcceptingOrders: boolean;
  contactPhone: string | null;
  cuisines: string[];
}

export interface MealDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  images: string[];
  price: number;
  mrp: number | null;
  foodType: FoodType;
  goalTags: string[];
  slots: string[];
  nutrition: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
  };
  isAvailable: boolean;
  isBestseller: boolean;
  orderCount: number;
}

export interface NutritionAnalysisResult {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  healthScore: number;
  isJunkFood: boolean;
  reason: string;
  suggestedGoalTags: string[];
}

export interface KitchenStory {
  id: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  durationSec: number;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  orderCount: number;
  mealName: string | null;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface KitchenOrderCard {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  customer: { name: string; phone: string };
  items: { name: string; quantity: number }[];
  orderNotes: string | null;
  placedAt: string;
  etaMinutes: number;
  allowedNextStatuses: OrderStatus[];
}

export interface DashboardSummary {
  accountStatus: KitchenAccountStatus;
  isAcceptingOrders: boolean;
  today: { orderCount: number; activeOrderCount: number; revenue: number };
  allTime: {
    orderCount: number;
    revenue: number;
    rating: number;
    ratingCount: number;
    followerCount: number;
    activeMealCount: number;
  };
  actionNeeded: string | null;
}

export interface Paginated<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean };
}
