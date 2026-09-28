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
  capacity?: number;
}

export interface MealCustomizationOption {
  name: string;
  priceDelta: number;
}

export interface MealCustomizationGroup {
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
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
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

/**
 * The exact inner shape of `lastPayout` wasn't part of this round's verified
 * surface — fields are optional so the summary card can render whatever
 * comes back without risking a crash on a field that isn't there.
 */
export interface PayoutSummaryLastPayout {
  id?: string;
  amount?: number;
  status?: string;
  occurredAt?: string;
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
  /** 0 = Sunday .. 6 = Saturday. */
  dayOfWeek: number;
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
