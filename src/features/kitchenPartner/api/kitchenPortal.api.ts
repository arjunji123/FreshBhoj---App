import { kitchenClient } from './kitchenClient';
import type {
  BhojAiHistoryResponse,
  BhojAiReplyResponse,
  Campaign,
  CampaignEstimate,
  CampaignStatus,
  CampaignSuggestion,
  CampaignSuggestionStatus,
  DashboardSummary,
  FssaiAssistanceDocumentType,
  FssaiAssistanceStatusResponse,
  KitchenAccount,
  KitchenDocumentType,
  KitchenOrderCard,
  KitchenProfile,
  KitchenReel,
  KitchenStory,
  KitchenTokenPair,
  KitchenType,
  MealCustomizationGroup,
  MealDetail,
  NotificationCategory,
  NotificationsResponse,
  NutritionAnalysisResult,
  OnboardingStatus,
  OperatingHoursHoliday,
  OperatingHoursResponse,
  OperatingHoursWeeklyRow,
  OrderMessage,
  OrderStatus,
  Paginated,
  PayoutSummary,
  PayoutTransaction,
  PremiumSubscription,
  PremiumTier,
  PremiumTierCatalog,
  SubscriptionDelivery,
  SubscriptionDetail,
  SubscriptionsListResponse,
  SubscriptionStatus,
  WalletSummary,
  WalletTransaction,
} from '../kitchenPartner.types';

// ── Auth ──────────────────────────────────────────────────────────────────

export const kitchenAuthApi = {
  sendOtp: (phone: string) =>
    kitchenClient.post<{ expiresInMinutes: number; devOtp?: string }>('/partner/auth/otp/send', { phone }, { skipAuth: true }),

  verifyOtp: (phone: string, otp: string) =>
    kitchenClient.post<{ isNewAccount: boolean; account: KitchenAccount; tokens: KitchenTokenPair }>(
      '/partner/auth/otp/verify',
      { phone, otp },
      { skipAuth: true },
    ),

  logout: () => kitchenClient.post<null>('/partner/auth/logout'),

  requestAccountDeletion: (phone: string) =>
    kitchenClient.post<{ expiresInMinutes: number; devOtp?: string }>(
      '/partner/auth/account-deletion/request',
      { phone },
      { skipAuth: true },
    ),

  confirmAccountDeletion: (phone: string, otp: string) =>
    kitchenClient.post<null>('/partner/auth/account-deletion/confirm', { phone, otp }, { skipAuth: true }),
};

// ── Onboarding ────────────────────────────────────────────────────────────

export interface OwnerDetailsInput {
  ownerName: string;
  email?: string;
}

export interface KitchenDetailsInput {
  name: string;
  kitchenType: KitchenType;
  tagline?: string;
  description?: string;
  contactPhone?: string;
  prepTimeMins?: number;
  opensAt?: string;
  closesAt?: string;
  cuisineSlugs?: string[];
}

export interface LocationInput {
  addressLine: string;
  locality: string;
  city?: string;
  state?: string;
  pincode: string;
  latitude: number;
  longitude: number;
  serviceRadiusKm: number;
}

export interface OnboardingDocumentInput {
  type: KitchenDocumentType;
  number?: string;
  fileUrl: string;
}

export interface BankDetailsInput {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName?: string;
  upiId?: string;
}

export const kitchenOnboardingApi = {
  status: () => kitchenClient.get<OnboardingStatus>('/partner/onboarding/status'),
  ownerDetails: (input: OwnerDetailsInput) => kitchenClient.post<OnboardingStatus>('/partner/onboarding/owner-details', input),
  kitchenDetails: (input: KitchenDetailsInput) => kitchenClient.post<OnboardingStatus>('/partner/onboarding/kitchen-details', input),
  location: (input: LocationInput) => kitchenClient.post<OnboardingStatus>('/partner/onboarding/location', input),
  uploadDocument: (input: OnboardingDocumentInput) => kitchenClient.post<OnboardingStatus>('/partner/onboarding/documents', input),
  bankDetails: (input: BankDetailsInput) => kitchenClient.post<OnboardingStatus>('/partner/onboarding/bank-details', input),
  submit: () => kitchenClient.post<OnboardingStatus>('/partner/onboarding/submit'),
  simulateApprove: () => kitchenClient.post<OnboardingStatus>('/partner/onboarding/simulate/approve'),
};

// ── Profile ───────────────────────────────────────────────────────────────

export const kitchenProfileApi = {
  get: () => kitchenClient.get<KitchenProfile>('/partner/kitchen'),
  update: (input: Partial<KitchenProfile>) => kitchenClient.patch<KitchenProfile>('/partner/kitchen', input),
  setAcceptingOrders: (isAcceptingOrders: boolean) =>
    kitchenClient.patch<KitchenProfile>('/partner/kitchen/accepting-orders', { isAcceptingOrders }),
};

// ── Menu ──────────────────────────────────────────────────────────────────

export interface UpsertMealInput {
  name: string;
  description?: string;
  images: string[];
  price: number;
  mrp?: number;
  foodType: string;
  slots?: string[];
  goalTags?: string[];
  calories: number;
  proteinG: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  isAvailable?: boolean;
  isJainAvailable?: boolean;
  prepTimeMins?: number;
  cuisineSlug?: string;
  customizationGroups?: MealCustomizationGroup[];
}

export const kitchenMenuApi = {
  list: (includeUnavailable = true) => kitchenClient.get<MealDetail[]>(`/partner/menu?includeUnavailable=${includeUnavailable}`),
  get: (id: string) => kitchenClient.get<MealDetail>(`/partner/menu/${id}`),
  create: (input: UpsertMealInput) => kitchenClient.post<MealDetail>('/partner/menu', input),
  update: (id: string, input: Partial<UpsertMealInput>) => kitchenClient.patch<MealDetail>(`/partner/menu/${id}`, input),
  setAvailability: (id: string, isAvailable: boolean) =>
    kitchenClient.patch<{ id: string; isAvailable: boolean }>(`/partner/menu/${id}/availability`, { isAvailable }),
  remove: (id: string) => kitchenClient.delete<{ id: string }>(`/partner/menu/${id}`),
  analyze: (input: { name: string; description?: string; ingredients?: string[] }) =>
    kitchenClient.post<NutritionAnalysisResult>('/partner/menu/analyze', input),
};

// ── Orders ────────────────────────────────────────────────────────────────

export const kitchenOrdersApi = {
  incoming: () => kitchenClient.get<KitchenOrderCard[]>('/partner/orders/incoming'),
  advanceStatus: (id: string, status: OrderStatus, note?: string) =>
    kitchenClient.post<KitchenOrderCard>(`/partner/orders/${id}/status`, { status, note }),
  list: (params: { page?: number; limit?: number; status?: OrderStatus[]; dateFrom?: string; dateTo?: string }) =>
    kitchenClient.get<Paginated<KitchenOrderCard>>('/partner/orders', { query: params }),
};

// ── Stories ───────────────────────────────────────────────────────────────

export const kitchenStoriesApi = {
  list: () => kitchenClient.get<KitchenStory[]>('/partner/stories'),
  publish: (input: {
    mediaType: string;
    mediaUrl: string;
    thumbnailUrl?: string;
    caption?: string;
    mealId?: string;
    durationSec?: number;
  }) => kitchenClient.post<KitchenStory>('/partner/stories', input),
  deactivate: (id: string) => kitchenClient.delete<{ id: string }>(`/partner/stories/${id}`),
  updateCaption: (id: string, caption: string) => kitchenClient.patch<KitchenStory>(`/partner/stories/${id}`, { caption }),
};

// ── Reels ─────────────────────────────────────────────────────────────────

export const kitchenReelsApi = {
  list: () => kitchenClient.get<KitchenReel[]>('/partner/reels'),
  publish: (input: {
    videoUrl: string;
    thumbnailUrl?: string;
    caption?: string;
    hashtags?: string[];
    mealId?: string;
    durationSec?: number;
  }) => kitchenClient.post<KitchenReel>('/partner/reels', input),
  update: (id: string, input: { caption?: string; hashtags?: string[] }) =>
    kitchenClient.patch<KitchenReel>(`/partner/reels/${id}`, input),
  archive: (id: string) => kitchenClient.delete<{ id: string }>(`/partner/reels/${id}`),
  pause: (id: string) => kitchenClient.post<KitchenReel>(`/partner/reels/${id}/pause`),
  resume: (id: string) => kitchenClient.post<KitchenReel>(`/partner/reels/${id}/resume`),
};

// ── Dashboard ─────────────────────────────────────────────────────────────

export const kitchenDashboardApi = {
  summary: () => kitchenClient.get<DashboardSummary>('/partner/dashboard/summary'),
};

// ── FSSAI Assistance ──────────────────────────────────────────────────────

export const kitchenFssaiAssistanceApi = {
  status: () => kitchenClient.get<FssaiAssistanceStatusResponse>('/partner/fssai-assistance/status'),
  start: () => kitchenClient.post<FssaiAssistanceStatusResponse>('/partner/fssai-assistance/start'),
  uploadDocument: (input: { type: FssaiAssistanceDocumentType; fileUrl: string }) =>
    kitchenClient.post<FssaiAssistanceStatusResponse>('/partner/fssai-assistance/documents', input),
  confirmPayment: () => kitchenClient.post<FssaiAssistanceStatusResponse>('/partner/fssai-assistance/confirm-payment'),
  cancel: () => kitchenClient.post<FssaiAssistanceStatusResponse>('/partner/fssai-assistance/cancel'),
  simulateAdvance: () => kitchenClient.post<FssaiAssistanceStatusResponse>('/partner/fssai-assistance/simulate/advance'),
};

// ── BhojAI ────────────────────────────────────────────────────────────────

export const kitchenBhojAiApi = {
  sendMessage: (message: string) => kitchenClient.post<BhojAiReplyResponse>('/partner/bhojai/message', { message }),
  history: () => kitchenClient.get<BhojAiHistoryResponse>('/partner/bhojai/history'),
  reset: () => kitchenClient.post<null>('/partner/bhojai/reset'),
};

// ── Notifications ─────────────────────────────────────────────────────────

export const kitchenNotificationsApi = {
  list: (params: { category?: NotificationCategory; page?: number; limit?: number }) =>
    kitchenClient.get<NotificationsResponse>('/partner/notifications', { query: params }),
  markRead: (id: string) => kitchenClient.post<null>(`/partner/notifications/${id}/read`),
  markAllRead: () => kitchenClient.post<{ updatedCount: number }>('/partner/notifications/read-all'),
};

// ── Payouts ───────────────────────────────────────────────────────────────

export const kitchenPayoutsApi = {
  summary: () => kitchenClient.get<PayoutSummary>('/partner/payouts/summary'),
  /** 400s (surfaced as `KitchenApiError`) when there's nothing available or no bank account on file. */
  request: () => kitchenClient.post<unknown>('/partner/payouts/request'),
  list: (params: { page?: number; limit?: number }) => kitchenClient.get<Paginated<PayoutTransaction>>('/partner/payouts', { query: params }),
};

// ── Kitchen Wallet ────────────────────────────────────────────────────────
// Funds reel boosts and premium plan purchases. No payment gateway is
// wired — `topup` completes immediately, same placeholder pattern as every
// other payment-adjacent flow in this app.

export const kitchenWalletApi = {
  summary: () => kitchenClient.get<WalletSummary>('/partner/wallet'),
  transactions: (params: { page?: number; limit?: number }) =>
    kitchenClient.get<Paginated<WalletTransaction>>('/partner/wallet/transactions', { query: params }),
  topup: (amountRs: number) =>
    kitchenClient.post<{ wallet: WalletSummary; transaction: WalletTransaction }>('/partner/wallet/topup', { amountRs }),
};

// ── Operating Hours ───────────────────────────────────────────────────────

export interface UpdateWeeklyHoursInput {
  isClosed: boolean;
  session1Start?: string;
  session1End?: string;
  session2Start?: string;
  session2End?: string;
}

export interface UpsertHolidayInput {
  date: string;
  isClosed: boolean;
  session1Start?: string;
  session1End?: string;
  session2Start?: string;
  session2End?: string;
  note?: string;
}

export const kitchenOperatingHoursApi = {
  get: () => kitchenClient.get<OperatingHoursResponse>('/partner/operating-hours'),
  updateDay: (dayOfWeek: number, input: UpdateWeeklyHoursInput) =>
    kitchenClient.put<OperatingHoursWeeklyRow>(`/partner/operating-hours/${dayOfWeek}`, input),
  addHoliday: (input: UpsertHolidayInput) => kitchenClient.post<OperatingHoursHoliday>('/partner/operating-hours/holidays', input),
  removeHoliday: (date: string) => kitchenClient.delete<{ date: string }>(`/partner/operating-hours/holidays/${date}`),
};

// ── Order Chat ────────────────────────────────────────────────────────────
// Calling `list` marks unread CUSTOMER messages as read (server-side side
// effect) — same shape either way, so no separate "peek" endpoint.

export const kitchenOrderChatApi = {
  list: (orderId: string) => kitchenClient.get<OrderMessage[]>(`/partner/orders/${orderId}/messages`),
  send: (orderId: string, body: string, advanceToStatus?: OrderStatus) =>
    kitchenClient.post<OrderMessage>(`/partner/orders/${orderId}/messages`, { body, advanceToStatus }),
};

// ── Reel Ads / Campaigns ──────────────────────────────────────────────────

export const kitchenAdsApi = {
  estimate: (dailyBudgetRs: number) =>
    kitchenClient.get<CampaignEstimate>('/partner/ads/campaigns/estimate', { query: { dailyBudgetRs } }),
  /**
   * Boost creation — replaced the old free/indefinite campaign flow.
   * `dailyBudgetRs × durationDays` is charged from the wallet immediately;
   * a 400 "Insufficient wallet balance" comes back if short. No `endDate`
   * input anymore — `durationDays` is mandatory.
   */
  create: (input: { reelId: string; dailyBudgetRs: number; durationDays: number }) =>
    kitchenClient.post<Campaign>('/partner/ads/campaigns', input),
  /** No `dailyStats` on list rows — fetch `get(id)` or `analytics([id])` for the chart. */
  list: (status?: CampaignStatus) => kitchenClient.get<Campaign[]>('/partner/ads/campaigns', { query: { status } }),
  get: (id: string) => kitchenClient.get<Campaign>(`/partner/ads/campaigns/${id}`),
  /** Batch fetch (with `dailyStats`) for comparing a handful of campaigns at once. */
  analytics: (ids: string[]) =>
    kitchenClient.get<Campaign[]>('/partner/ads/campaigns/analytics', { query: { ids: ids.join(',') } }),
  pause: (id: string) => kitchenClient.post<Campaign>(`/partner/ads/campaigns/${id}/pause`),
  resume: (id: string) => kitchenClient.post<Campaign>(`/partner/ads/campaigns/${id}/resume`),
  stop: (id: string) => kitchenClient.post<Campaign>(`/partner/ads/campaigns/${id}/stop`),
};

// ── AI Optimization Suggestions ──────────────────────────────────────────

export const kitchenSuggestionsApi = {
  /**
   * Capped to once per kitchen per IST day — calling again same-day just
   * re-returns the same batch. 400 if there are zero ACTIVE campaigns.
   * Can 503 ("AI suggestions are temporarily unavailable") when Gemini is
   * under load — callers should treat that as a normal retry-able error.
   */
  generate: () => kitchenClient.post<CampaignSuggestion[]>('/partner/ads/suggestions/generate'),
  list: (params: { status?: CampaignSuggestionStatus; q?: string; page?: number; limit?: number }) =>
    kitchenClient.get<Paginated<CampaignSuggestion>>('/partner/ads/suggestions', { query: params }),
  get: (id: string) => kitchenClient.get<CampaignSuggestion>(`/partner/ads/suggestions/${id}`),
  /** 400 unless the suggestion is still `NEW`. */
  apply: (id: string) => kitchenClient.post<CampaignSuggestion>(`/partner/ads/suggestions/${id}/apply`),
  dismiss: (id: string) => kitchenClient.post<CampaignSuggestion>(`/partner/ads/suggestions/${id}/dismiss`),
};

// ── Kitchen Premium Plans ─────────────────────────────────────────────────

export const kitchenPremiumApi = {
  tiers: () => kitchenClient.get<PremiumTierCatalog[]>('/partner/premium/tiers'),
  subscription: () => kitchenClient.get<PremiumSubscription>('/partner/premium/subscription'),
  /** Same endpoint for a first purchase and an upgrade. Charges the wallet immediately; 400 if short. */
  purchase: (tier: PremiumTier) => kitchenClient.post<PremiumSubscription>('/partner/premium/purchase', { tier }),
};

// ── Subscriptions (kitchen-facing) ────────────────────────────────────────

export const kitchenSubscriptionsApi = {
  list: (params: { status?: SubscriptionStatus; q?: string; page?: number; limit?: number }) =>
    kitchenClient.get<SubscriptionsListResponse>('/partner/subscriptions', { query: params }),
  get: (id: string) => kitchenClient.get<SubscriptionDetail>(`/partner/subscriptions/${id}`),
  approve: (id: string) => kitchenClient.post<SubscriptionDetail>(`/partner/subscriptions/${id}/approve`),
  reject: (id: string, reason: string) => kitchenClient.post<unknown>(`/partner/subscriptions/${id}/reject`, { reason }),
  pause: (id: string) => kitchenClient.post<unknown>(`/partner/subscriptions/${id}/pause`),
  resume: (id: string) => kitchenClient.post<unknown>(`/partner/subscriptions/${id}/resume`),
  /** `date` is the exact `YYYY-MM-DD` from that subscription's own `deliverySchedule[0].date`. */
  dispatchDelivery: (id: string, date: string) =>
    kitchenClient.post<SubscriptionDelivery>(`/partner/subscriptions/${id}/deliveries/${date}/dispatch`),
  skipDelivery: (id: string, date: string, reason?: string) =>
    kitchenClient.post<SubscriptionDelivery>(`/partner/subscriptions/${id}/deliveries/${date}/skip`, { reason }),
};

// ── Upload ────────────────────────────────────────────────────────────────

const EXTENSION_MIME_TYPES: Record<string, string> = {
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v',
  webm: 'video/webm',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heic',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

/**
 * react-native-image-picker sometimes omits `type`, especially for video on
 * some devices/formats. Falling back straight to 'image/jpeg' mis-tags a
 * video upload, so try the file extension first and only fall back to the
 * caller-provided (or default) type when that doesn't resolve either.
 */
function resolveUploadMimeType(asset: { uri: string; type?: string; fileName?: string }, fallbackType?: string): string {
  if (asset.type) return asset.type;
  const source = asset.fileName ?? asset.uri;
  const ext = source.split('.').pop()?.toLowerCase().split(/[?#]/)[0];
  if (ext && EXTENSION_MIME_TYPES[ext]) return EXTENSION_MIME_TYPES[ext];
  return fallbackType ?? 'image/jpeg';
}

export const kitchenUploadApi = {
  /**
   * `asset` is a react-native-image-picker result — `{uri, type, fileName}`.
   * `fallbackType` lets the caller say whether it picked a photo or a video
   * when the picker itself didn't return a MIME type and the extension is
   * ambiguous.
   */
  upload: (asset: { uri: string; type?: string; fileName?: string }, purpose: string, fallbackType?: string) => {
    const form = new FormData();
    form.append('file', {
      uri: asset.uri,
      type: resolveUploadMimeType(asset, fallbackType),
      name: asset.fileName ?? `upload-${Date.now()}.jpg`,
    } as any);
    form.append('purpose', purpose);
    // Story videos can legitimately take longer than the default timeout on
    // a slow connection — give uploads more room than a normal API call.
    return kitchenClient.post<{ url: string }>('/partner/upload', form, { timeoutMs: 90_000 });
  },
};
