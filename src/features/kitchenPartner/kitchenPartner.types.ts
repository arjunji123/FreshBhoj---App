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

export type KitchenDocumentType =
  | 'FSSAI'
  | 'GST'
  | 'PAN'
  | 'AADHAAR'
  | 'SHOP_LICENSE'
  | 'BANK_PROOF'
  | 'KITCHEN_PHOTO_FRONT'
  | 'KITCHEN_PHOTO_MAIN';

/** Matches the backend's `kitchenType` enum on the kitchen-details onboarding step. */
export type KitchenType = 'HOME_KITCHEN' | 'CLOUD_KITCHEN' | 'RESTAURANT' | 'TIFFIN_SERVICE';

export type DocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
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
  submittedAt: string | null;
  approvedAt: string | null;
}

export interface OnboardingStepState {
  step: KitchenOnboardingStep;
  label: string;
  description: string;
  isComplete: boolean;
  isCurrent: boolean;
}

export interface KitchenDocument {
  id: string;
  type: KitchenDocumentType;
  number: string | null;
  fileUrl: string;
  status: DocumentStatus;
  remarks: string | null;
}

export interface KitchenBankAccount {
  accountHolderName: string;
  accountNumberMasked: string;
  ifsc: string;
  bankName: string | null;
  upiId: string | null;
  isVerified: boolean;
}

export interface OnboardingStatus {
  status: KitchenAccountStatus;
  currentStep: KitchenOnboardingStep;
  progressPercent: number;
  steps: OnboardingStepState[];
  canSubmit: boolean;
  pending: string[];
  rejectionReason: string | null;
  documents: KitchenDocument[];
  bankAccount: KitchenBankAccount | null;
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
  addressLine: string | null;
  locality: string | null;
  city: string;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  prepTimeMins: number;
  opensAt: string;
  closesAt: string;
  isAcceptingOrders: boolean;
  contactPhone: string | null;
  fssaiLicense: string | null;
  hygieneScore: number | null;
  cuisines: string[];
  createdAt: string;
  /** Free-form tags the kitchen wants to highlight, e.g. "No onion no garlic". */
  specialities?: string[];
  /** Max simultaneous orders the kitchen can comfortably handle. */
  capacity?: number | null;
}

export interface MealCustomizationOption {
  /** Echoed by the backend on reads — must NOT be sent back on create/update (the DTO rejects unknown fields). */
  id?: string;
  name: string;
  priceDelta: number;
  isDefault?: boolean;
}

export interface MealCustomizationGroup {
  /** Read-only, see `MealCustomizationOption.id`. */
  id?: string;
  name: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  options: MealCustomizationOption[];
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
  category: { id: string; slug: string; name: string } | null;
  goalTags: string[];
  slots: string[];
  nutrition: {
    calories: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
    fiberG: number | null;
  };
  isAvailable: boolean;
  isBestseller: boolean;
  orderCount: number;
  /** Optional fields the meal form reads back for editing — present only when the backend echoes them. */
  prepTimeMins?: number;
  cuisineSlug?: string | null;
  isJainAvailable?: boolean;
  customizationGroups?: MealCustomizationGroup[];
}

/** Public catalog entry (`GET /catalog/cuisines`) — used to tag a dish with its cuisine. */
export interface CuisineOption {
  id: string;
  slug: string;
  name: string;
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

export type ReelStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface KitchenReel {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  hashtags: string[];
  durationSec: number;
  status: ReelStatus;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  mealName: string | null;
  publishedAt: string;
  createdAt: string;
  isPaused: boolean;
  /** Ops-set, read-only on the partner app. */
  isSponsored: boolean;
  /** Live-computed count of orders attributed to this reel. */
  orderCount: number;
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
  /** 7 entries, oldest to newest, `date` as `YYYY-MM-DD`. Powers the dashboard's revenue chart. */
  weeklyRevenue: { date: string; revenue: number }[];
  actionNeeded: string | null;
}

export interface Paginated<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean };
}

// ── FSSAI Assistance ─────────────────────────────────────────────────────
// A concierge service: FreshBhoj handles the government FSSAI food-safety
// licence registration on a partner's behalf for a flat fee. No real payment
// gateway is wired yet — `confirm-payment` is an explicit placeholder step.

export type FssaiAssistanceStatus =
  | 'PENDING_PAYMENT'
  | 'DOCUMENTS_SUBMITTED'
  | 'APPLICATION_FILED'
  | 'GOVT_REVIEW_IN_PROGRESS'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type FssaiAssistanceDocumentType = 'IDENTITY_PROOF' | 'ADDRESS_PROOF' | 'KITCHEN_PHOTO' | 'PASSPORT_PHOTO';

export interface FssaiAssistanceRequest {
  id: string;
  status: FssaiAssistanceStatus;
  govtFee: number;
  serviceFee: number;
  totalFee: number;
  paymentStatus: PaymentStatus;
  licenseNumber: string | null;
  validFrom: string | null;
  validTill: string | null;
  certificateUrl: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  filedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export interface FssaiAssistanceDocument {
  id: string;
  type: FssaiAssistanceDocumentType;
  fileUrl: string;
  status: DocumentStatus;
  remarks: string | null;
}

export interface FssaiAssistanceStatusResponse {
  request: FssaiAssistanceRequest | null;
  documents: FssaiAssistanceDocument[];
}

// ── BhojAI ────────────────────────────────────────────────────────────────
// A partner-facing chat assistant. Replies are plain text, sometimes paired
// with a small, backend-authored "card" object that the client renders as
// real UI (never raw JSON). The raw wire shape keeps `card` as an untyped
// record — `parseBhojAiCard` (in the chat screen) is what actually narrows
// it into one of the known card types below, falling back to text-only
// rendering for anything it doesn't recognise.

export type BhojAiRole = 'USER' | 'MODEL';

export interface BhojAiFssaiTimelineStage {
  stage: string;
  isComplete: boolean;
  isCurrent: boolean;
}

export interface BhojAiFssaiStatusCard {
  type: 'FSSAI_STATUS';
  status: string;
  progressPercent: number;
  timeline: BhojAiFssaiTimelineStage[];
  estimatedDaysLeft: number | null;
}

export interface BhojAiDocumentRejectedCard {
  type: 'DOCUMENT_REJECTED';
  rejectionReason: string | null;
  rejectedDocuments: { type: string; remarks: string | null }[];
  nextSteps: string[];
}

export interface BhojAiEscalationCard {
  type: 'ESCALATION_CREATED';
  reason: string;
}

export type BhojAiCard = BhojAiFssaiStatusCard | BhojAiDocumentRejectedCard | BhojAiEscalationCard;

export interface BhojAiMessage {
  id: string;
  role: BhojAiRole;
  text: string | null;
  /** Raw wire shape — see the module comment above. */
  card: Record<string, unknown> | null;
  createdAt: string;
}

export interface BhojAiReplyResponse {
  message: string;
  card: Record<string, unknown> | null;
}

export interface BhojAiHistoryResponse {
  messages: BhojAiMessage[];
}

// ── Notifications ─────────────────────────────────────────────────────────

export type NotificationCategory = 'ORDER' | 'SUBSCRIPTION' | 'REEL' | 'GENERAL';

export interface KitchenNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse extends Paginated<KitchenNotification> {
  unreadCount: number;
}

// ── Payouts ───────────────────────────────────────────────────────────────

export interface PayoutBankAccount {
  accountHolderName: string;
  accountNumberMasked: string;
  ifsc: string;
  bankName: string;
  isVerified: boolean;
}

export type PayoutStatus = 'REQUESTED' | 'PROCESSING' | 'PAID' | 'FAILED';

/** The payout record exactly as `GET /partner/payouts/summary` returns it for `lastPayout`. */
export interface PayoutSummaryLastPayout {
  id: string;
  amount: number;
  status: PayoutStatus;
  transferRef: string | null;
  failureReason: string | null;
  requestedAt: string;
  processedAt: string | null;
  paidAt: string | null;
}

export interface PayoutSummary {
  totalEarnings: number;
  availableForPayout: number;
  lastPayout: PayoutSummaryLastPayout | null;
  /** Always null for now — no scheduled-payout feature yet. */
  nextScheduledAt: string | null;
  bankAccount: PayoutBankAccount | null;
}

export type PayoutTransactionType = 'ORDER' | 'PAYOUT';

export interface PayoutTransaction {
  id: string;
  type: PayoutTransactionType;
  amount: number;
  sign: 1 | -1;
  status: string;
  label: string;
  occurredAt: string;
}

// ── Operating Hours ───────────────────────────────────────────────────────

export interface OperatingHoursWeeklyRow {
  id: string;
  /** Backend enum string, MONDAY..SUNDAY (not a number). */
  dayOfWeek: DayOfWeek;
  isClosed: boolean;
  session1Start: string | null;
  session1End: string | null;
  session2Start: string | null;
  session2End: string | null;
}

export interface OperatingHoursHoliday {
  id: string;
  /** `YYYY-MM-DD`. */
  date: string;
  isClosed: boolean;
  session1Start: string | null;
  session1End: string | null;
  session2Start: string | null;
  session2End: string | null;
  note: string | null;
}

export interface OperatingHoursResponse {
  weekly: OperatingHoursWeeklyRow[];
  holidays: OperatingHoursHoliday[];
}

// ── Order Chat ───────────────────────────────────────────────────────────
// Per-order messaging thread between the kitchen and the customer. No
// websockets on this backend — the chat screen polls `GET .../messages`,
// which also marks unread CUSTOMER messages as read as a side effect.

export type OrderMessageSender = 'KITCHEN' | 'CUSTOMER';

export interface OrderMessage {
  id: string;
  sender: OrderMessageSender;
  body: string;
  /** Set when this message carried a status change, e.g. "Out for delivery". */
  triggeredStatus: OrderStatus | null;
  isRead: boolean;
  createdAt: string;
}

// ── Reel Ads / Campaigns ─────────────────────────────────────────────────

export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'ENDED';

export interface CampaignDailyStat {
  date: string;
  impressions: number;
  clicks: number;
}

export interface CampaignReelSummary {
  thumbnailUrl: string | null;
  videoUrl: string;
  caption: string | null;
}

export interface CampaignEstimate {
  min: number;
  max: number;
}

export interface Campaign {
  id: string;
  reelId: string;
  reel: CampaignReelSummary | null;
  dailyBudgetRs: number;
  /** `YYYY-MM-DD`, or null when the campaign runs indefinitely. */
  endDate: string | null;
  /** Boost duration in days, set at creation — the full cost (`dailyBudgetRs × durationDays`) is charged from the wallet upfront. */
  durationDays: number | null;
  status: CampaignStatus;
  spendRs: number;
  impressions: number;
  clicks: number;
  /** Percent, e.g. `2.4` for 2.4%. */
  ctr: number;
  ordersCount: number;
  revenueRs: number;
  roi: number;
  estimatedReach: CampaignEstimate;
  actualReach: number;
  /** Only present on the single-campaign detail / analytics-batch responses. */
  dailyStats?: CampaignDailyStat[];
  createdAt: string;
  pausedAt: string | null;
  endedAt: string | null;
}

// ── Subscriptions (kitchen-facing) ───────────────────────────────────────

export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'REJECTED';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type SubscriptionDeliveryTime = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS';
export type BillingCycle = 'WEEKLY' | 'MONTHLY';
export type DeliveryScheduleStatus = 'SCHEDULED' | 'DISPATCHED' | 'SKIPPED';

export interface SubscriptionCustomer {
  id: string;
  fullName: string | null;
  phone: string;
  profileImage: string | null;
}

export interface Subscription {
  id: string;
  planName: string;
  foodType: FoodType;
  mealsPerDay: number;
  deliveryDays: DayOfWeek[];
  deliveryTime: SubscriptionDeliveryTime;
  billingCycle: BillingCycle;
  pricePerCycle: number;
  status: SubscriptionStatus;
  startDate: string;
  approvedAt: string | null;
  pausedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  customer: SubscriptionCustomer;
}

export interface DeliveryScheduleEntry {
  /** `YYYY-MM-DD`. */
  date: string;
  status: DeliveryScheduleStatus;
  dispatchedAt: string | null;
  skipReason: string | null;
}

export interface BillingHistoryEntry {
  cycleStart: string;
  amount: number;
  /** Always `'PAID'` in practice — placeholder billing, no real gateway. */
  paymentStatus: string;
}

export interface SubscriptionDetail extends Subscription {
  specialInstructions: string | null;
  rejectionReason: string | null;
  /** Rolling 7-day window, today first. */
  deliverySchedule: DeliveryScheduleEntry[];
  billingHistory: BillingHistoryEntry[];
}

export interface SubscriptionCounts {
  PENDING: number;
  ACTIVE: number;
  PAUSED: number;
  CANCELLED: number;
  REJECTED: number;
}

export interface SubscriptionsListResponse {
  items: Subscription[];
  meta: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean };
  counts: SubscriptionCounts;
}

export type SubscriptionDeliveryStatus = 'DISPATCHED' | 'SKIPPED';

export interface SubscriptionDelivery {
  id: string;
  subscriptionId: string;
  date: string;
  status: SubscriptionDeliveryStatus;
  dispatchedAt: string | null;
  skipReason: string | null;
  createdAt: string;
}

// ── Subscription Plans (kitchen-facing templates) ────────────────────────
// Reusable plan templates a kitchen authors once; customers browse and
// subscribe to them from the public kitchen profile. Separate from the
// bespoke `Subscription` a customer can also request directly — subscribing
// off a plan just pre-fills that same request with `planId`.

export interface SubscriptionPlan {
  id: string;
  name: string;
  billingCycle: BillingCycle;
  deliveryDays: DayOfWeek[];
  mealsPerDay: number;
  priceRs: number;
  originalPriceRs: number | null;
  discountPercent: number;
  dietOptions: FoodType[];
  jainAvailable: boolean;
  slotOptions: SubscriptionDeliveryTime[];
  includesDescription: string;
  isPopular: boolean;
  isActive: boolean;
  subscriberCount: number;
  createdAt: string;
}

export interface CreateSubscriptionPlanInput {
  name: string;
  billingCycle: BillingCycle;
  deliveryDays: DayOfWeek[];
  mealsPerDay: number;
  priceRs: number;
  originalPriceRs?: number;
  dietOptions: FoodType[];
  jainAvailable?: boolean;
  slotOptions: SubscriptionDeliveryTime[];
  includesDescription: string;
  isPopular?: boolean;
}

/** Any subset of the create fields, plus `isActive` — the only way to hide a plan from browsing (no delete endpoint by design). */
export type UpdateSubscriptionPlanInput = Partial<CreateSubscriptionPlanInput> & { isActive?: boolean };

// ── Kitchen Wallet ────────────────────────────────────────────────────────
// Funds a kitchen's reel boosts and premium plan purchases. No real payment
// gateway is wired — `topup` completes immediately, same placeholder pattern
// as FSSAI assistance payment and subscription billing.

export type WalletTransactionType = 'CREDIT' | 'DEBIT';
export type WalletTransactionReason = 'TOPUP' | 'AD_BOOST' | 'PREMIUM_PLAN';

export interface WalletSummary {
  balanceRs: number;
  totalCreditsRs: number;
  thisMonthSpentRs: number;
  nextBillingAt: string | null;
}

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  reason: WalletTransactionReason;
  amountRs: number;
  description: string;
  referenceId: string | null;
  createdAt: string;
}

// ── AI Optimization Suggestions ──────────────────────────────────────────
// Gemini-generated, once per kitchen per IST day. `generate` can 503 when
// the model is under load — callers should treat that as retry-able, not
// a crash.

export type CampaignSuggestionType = 'BUDGET_INCREASE' | 'DELIVERY_RADIUS' | 'TARGET_CUISINE' | 'CREATIVE_REFRESH';
export type CampaignSuggestionStatus = 'NEW' | 'APPLIED' | 'DISMISSED';
export type CampaignSuggestionEffort = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CampaignSuggestionImpact {
  reachDeltaPct: number | null;
  ordersDeltaPct: number | null;
  roiDeltaPct: number | null;
  expectedOrders: number | null;
  suggestedDailyBudgetRs: number | null;
  suggestedRadiusKm: number | null;
  costRs: number;
  effort: CampaignSuggestionEffort;
}

export interface CampaignSuggestionAppliedChange {
  field: string;
  before: number;
  after: number;
}

export interface CampaignSuggestion {
  id: string;
  type: CampaignSuggestionType;
  title: string;
  description: string;
  campaignId: string | null;
  impact: CampaignSuggestionImpact;
  reasoning: string;
  status: CampaignSuggestionStatus;
  appliedChanges: CampaignSuggestionAppliedChange | null;
  /** `YYYY-MM-DD`, IST — the daily batch this suggestion belongs to. */
  batchDate: string;
  appliedAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
}

// ── Kitchen Premium Plans ────────────────────────────────────────────────

export type PremiumTier = 'BASIC' | 'PRO' | 'ELITE';
export type PremiumSubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'NONE';

export interface PremiumFeatures {
  /** `null` = unlimited (PRO/ELITE); `2` for BASIC. */
  reelsPerMonth: number | null;
  advancedAnalytics: boolean;
  priorityBoostMultiplier: number;
  aiVideoEditing: boolean;
  sponsoredProfile: boolean;
  aiMenuInsights: boolean;
  prioritySupport: boolean;
  verifiedBadge: boolean;
  dedicatedGrowthManager: boolean;
}

export interface PremiumTierCatalog {
  tier: PremiumTier;
  /** Per 28-day period, placeholder pricing. */
  priceRs: number;
  /** Always PRO in practice. */
  isMostPopular: boolean;
  features: PremiumFeatures;
}

export interface PremiumSubscription {
  /** `null` only when `status === 'NONE'`. */
  tier: PremiumTier | null;
  status: PremiumSubscriptionStatus;
  priceRs: number | null;
  currentPeriodEnd: string | null;
  autoRenew: boolean;
  features: PremiumFeatures;
}
