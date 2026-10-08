import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BankDetailsInput,
  KitchenDetailsInput,
  kitchenAdsApi,
  kitchenBhojAiApi,
  kitchenDashboardApi,
  kitchenFssaiAssistanceApi,
  kitchenMenuApi,
  kitchenNotificationsApi,
  kitchenOnboardingApi,
  kitchenOperatingHoursApi,
  kitchenOrderChatApi,
  kitchenOrdersApi,
  kitchenPayoutsApi,
  kitchenPremiumApi,
  kitchenProfileApi,
  kitchenReelsApi,
  kitchenStoriesApi,
  kitchenSubscriptionPlansApi,
  kitchenSubscriptionsApi,
  kitchenSuggestionsApi,
  kitchenUploadApi,
  kitchenWalletApi,
  LocationInput,
  OnboardingDocumentInput,
  OwnerDetailsInput,
  UpdateWeeklyHoursInput,
  UpsertHolidayInput,
  UpsertMealInput,
} from '../api/kitchenPortal.api';
import type {
  CampaignStatus,
  CampaignSuggestionStatus,
  CreateSubscriptionPlanInput,
  DayOfWeek,
  FssaiAssistanceDocumentType,
  KitchenProfile,
  NotificationCategory,
  OrderMessage,
  OrderStatus,
  PremiumTier,
  SubscriptionStatus,
  UpdateSubscriptionPlanInput,
} from '../kitchenPartner.types';
import { useKitchenAuthStore } from '../store/kitchenAuthStore';

const kitchenKeys = {
  onboarding: ['kitchen', 'onboarding'] as const,
  dashboard: ['kitchen', 'dashboard'] as const,
  profile: ['kitchen', 'profile'] as const,
  orders: ['kitchen', 'orders'] as const,
  ordersHistory: (params: unknown) => ['kitchen', 'orders', 'history', params] as const,
  menu: ['kitchen', 'menu'] as const,
  cuisines: ['kitchen', 'cuisines'] as const,
  stories: ['kitchen', 'stories'] as const,
  reels: ['kitchen', 'reels'] as const,
  fssaiAssistance: ['kitchen', 'fssaiAssistance'] as const,
  bhojAiHistory: ['kitchen', 'bhojAi', 'history'] as const,
  notifications: ['kitchen', 'notifications'] as const,
  notificationsList: (params: unknown) => ['kitchen', 'notifications', 'list', params] as const,
  notificationsBadge: ['kitchen', 'notifications', 'badge'] as const,
  payoutsSummary: ['kitchen', 'payouts', 'summary'] as const,
  payoutsList: (params: unknown) => ['kitchen', 'payouts', 'list', params] as const,
  operatingHours: ['kitchen', 'operatingHours'] as const,
  orderMessages: (orderId: string) => ['kitchen', 'orders', orderId, 'messages'] as const,
  campaigns: ['kitchen', 'ads', 'campaigns'] as const,
  campaignsList: (status: CampaignStatus | undefined) => ['kitchen', 'ads', 'campaigns', 'list', status ?? 'ALL'] as const,
  campaignDetail: (id: string) => ['kitchen', 'ads', 'campaigns', 'detail', id] as const,
  campaignEstimate: (dailyBudgetRs: number) => ['kitchen', 'ads', 'campaigns', 'estimate', dailyBudgetRs] as const,
  subscriptions: ['kitchen', 'subscriptions'] as const,
  subscriptionsList: (params: unknown) => ['kitchen', 'subscriptions', 'list', params] as const,
  subscriptionDetail: (id: string) => ['kitchen', 'subscriptions', 'detail', id] as const,
  subscriptionPlans: ['kitchen', 'subscriptionPlans'] as const,
  wallet: ['kitchen', 'wallet'] as const,
  walletSummary: ['kitchen', 'wallet', 'summary'] as const,
  walletTransactions: (params: unknown) => ['kitchen', 'wallet', 'transactions', params] as const,
  suggestions: ['kitchen', 'ads', 'suggestions'] as const,
  suggestionsList: (params: unknown) => ['kitchen', 'ads', 'suggestions', 'list', params] as const,
  suggestionDetail: (id: string) => ['kitchen', 'ads', 'suggestions', 'detail', id] as const,
  premiumTiers: ['kitchen', 'premium', 'tiers'] as const,
  premiumSubscription: ['kitchen', 'premium', 'subscription'] as const,
};

function useKitchenAuthed() {
  return useKitchenAuthStore((s) => s.isAuthenticated);
}

export function useKitchenOnboardingStatus() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.onboarding, queryFn: kitchenOnboardingApi.status, enabled });
}

// ── Onboarding / registration steps ──────────────────────────────────────
// Every step-save mutation invalidates the status query — the status
// response (`currentStep`, `steps`, `progressPercent`, `pending`) is the
// single source of truth the registration screens render from.

export function useSaveOwnerDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OwnerDetailsInput) => kitchenOnboardingApi.ownerDetails(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.onboarding }),
  });
}

export function useSaveKitchenDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: KitchenDetailsInput) => kitchenOnboardingApi.kitchenDetails(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.onboarding }),
  });
}

export function useSaveLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LocationInput) => kitchenOnboardingApi.location(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.onboarding }),
  });
}

export function useUploadOnboardingDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OnboardingDocumentInput) => kitchenOnboardingApi.uploadDocument(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.onboarding }),
  });
}

export function useSaveBankDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BankDetailsInput) => kitchenOnboardingApi.bankDetails(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.onboarding }),
  });
}

export function useSubmitOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => kitchenOnboardingApi.submit(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.onboarding }),
  });
}

export function useSimulateApprove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => kitchenOnboardingApi.simulateApprove(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.onboarding }),
  });
}

export function useKitchenDashboard() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.dashboard, queryFn: kitchenDashboardApi.summary, enabled, refetchInterval: 30_000 });
}

export function useKitchenProfile() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.profile, queryFn: kitchenProfileApi.get, enabled });
}

export function useSetAcceptingOrders() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isAcceptingOrders: boolean) => kitchenProfileApi.setAcceptingOrders(isAcceptingOrders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.profile });
      queryClient.invalidateQueries({ queryKey: kitchenKeys.dashboard });
    },
  });
}

export function useUpdateKitchenProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<KitchenProfile>) => kitchenProfileApi.update(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.profile }),
  });
}

export function useKitchenIncomingOrders() {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.orders,
    queryFn: kitchenOrdersApi.incoming,
    enabled,
    refetchInterval: 15_000,
  });
}

export function useKitchenOrderHistory(params: { page: number; dateFrom?: string; dateTo?: string; status?: OrderStatus[] }) {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.ordersHistory(params),
    queryFn: () => kitchenOrdersApi.list({ ...params, limit: 20 }),
    enabled,
  });
}

export function useAdvanceOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) =>
      kitchenOrdersApi.advanceStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.orders });
      queryClient.invalidateQueries({ queryKey: kitchenKeys.dashboard });
    },
  });
}

export function useKitchenMenu() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.menu, queryFn: () => kitchenMenuApi.list(true), enabled });
}

export function useSetMealAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) => kitchenMenuApi.setAvailability(id, isAvailable),
    onSuccess: () => invalidateAfterMenuChange(queryClient),
  });
}

/** Menu changes move the dashboard's "dishes live" count and the onboarding funnel's menu step. */
function invalidateAfterMenuChange(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: kitchenKeys.menu });
  queryClient.invalidateQueries({ queryKey: kitchenKeys.dashboard });
  queryClient.invalidateQueries({ queryKey: kitchenKeys.onboarding });
}

export function useCreateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertMealInput) => kitchenMenuApi.create(input),
    onSuccess: () => invalidateAfterMenuChange(queryClient),
  });
}

export function useUpdateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<UpsertMealInput> }) => kitchenMenuApi.update(id, input),
    onSuccess: () => invalidateAfterMenuChange(queryClient),
  });
}

export function useDeleteMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kitchenMenuApi.remove(id),
    onSuccess: () => invalidateAfterMenuChange(queryClient),
  });
}

/** Cuisine catalog — static for a session, so cache it for a long while. */
export function useCuisineOptions() {
  return useQuery({ queryKey: kitchenKeys.cuisines, queryFn: kitchenMenuApi.cuisines, staleTime: 30 * 60_000 });
}

export function useAnalyzeMeal() {
  return useMutation({ mutationFn: kitchenMenuApi.analyze });
}

export function useKitchenStories() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.stories, queryFn: kitchenStoriesApi.list, enabled });
}

export function usePublishStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: kitchenStoriesApi.publish,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.stories }),
  });
}

export function useDeactivateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kitchenStoriesApi.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.stories }),
  });
}

export function useUpdateStoryCaption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, caption }: { id: string; caption: string }) => kitchenStoriesApi.updateCaption(id, caption),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.stories }),
  });
}

export function useKitchenReels() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.reels, queryFn: kitchenReelsApi.list, enabled });
}

export function usePublishReel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: kitchenReelsApi.publish,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.reels }),
  });
}

export function useUpdateReel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { caption?: string; hashtags?: string[] } }) =>
      kitchenReelsApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.reels }),
  });
}

export function useArchiveReel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kitchenReelsApi.archive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.reels }),
  });
}

export function usePauseReel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kitchenReelsApi.pause(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.reels }),
  });
}

export function useResumeReel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kitchenReelsApi.resume(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.reels }),
  });
}

export function useKitchenUpload() {
  return useMutation({
    mutationFn: ({
      asset,
      purpose,
      fallbackType,
    }: {
      asset: { uri: string; type?: string; fileName?: string; fileSize?: number };
      purpose: string;
      fallbackType?: string;
    }) => kitchenUploadApi.upload(asset, purpose, fallbackType),
  });
}

// ── FSSAI Assistance ──────────────────────────────────────────────────────
// Polls at the same 30s cadence as the dashboard summary — cheap while the
// gate/status-tracker screens are mounted, and harmless elsewhere since
// TanStack Query only refetches a query while it has an active observer.

export function useFssaiAssistanceStatus() {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.fssaiAssistance,
    queryFn: kitchenFssaiAssistanceApi.status,
    enabled,
    refetchInterval: 30_000,
  });
}

export function useStartFssaiAssistance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => kitchenFssaiAssistanceApi.start(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.fssaiAssistance }),
  });
}

export function useUploadFssaiAssistanceDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { type: FssaiAssistanceDocumentType; fileUrl: string }) => kitchenFssaiAssistanceApi.uploadDocument(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.fssaiAssistance }),
  });
}

export function useConfirmFssaiAssistancePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => kitchenFssaiAssistanceApi.confirmPayment(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.fssaiAssistance }),
  });
}

export function useCancelFssaiAssistance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => kitchenFssaiAssistanceApi.cancel(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.fssaiAssistance }),
  });
}

export function useSimulateFssaiAssistanceAdvance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => kitchenFssaiAssistanceApi.simulateAdvance(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.fssaiAssistance }),
  });
}

/**
 * Shared "pick a file, upload it, then register it as the kitchen's FSSAI
 * licence" logic — used both by `KitchenRegisterDocuments` (the registration
 * flow's own FSSAI slot) and `FssaiAssistanceChoice` ("I already have
 * FSSAI"). Picking the file itself stays with each screen (a couple of
 * lines, and each caller wants a slightly different picker), but the
 * upload-then-register-with-error-handling sequence is identical, so it
 * lives here once.
 */
export function useUploadFssaiLicenceDocument() {
  const upload = useKitchenUpload();
  const registerDocument = useUploadOnboardingDocument();

  const uploadAndRegister = (
    asset: { uri: string; type?: string; fileName?: string; fileSize?: number },
    options?: { number?: string; onSuccess?: () => void; onError?: (error: unknown) => void },
  ) => {
    upload.mutate(
      { asset, purpose: 'DOCUMENT' },
      {
        onSuccess: (uploaded) =>
          registerDocument.mutate(
            { type: 'FSSAI', fileUrl: uploaded.url, number: options?.number },
            {
              onSuccess: () => options?.onSuccess?.(),
              onError: (error) => options?.onError?.(error),
            },
          ),
        onError: (error) => options?.onError?.(error),
      },
    );
  };

  return { uploadAndRegister, isPending: upload.isPending || registerDocument.isPending };
}

// ── BhojAI ────────────────────────────────────────────────────────────────

export function useBhojAiHistory() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.bhojAiHistory, queryFn: kitchenBhojAiApi.history, enabled });
}

export function useSendBhojAiMessage() {
  return useMutation({ mutationFn: (message: string) => kitchenBhojAiApi.sendMessage(message) });
}

export function useResetBhojAi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => kitchenBhojAiApi.reset(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.bhojAiHistory }),
  });
}

// ── Notifications ─────────────────────────────────────────────────────────

export function useKitchenNotifications(params: { category?: NotificationCategory; page: number }) {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.notificationsList(params),
    queryFn: () => kitchenNotificationsApi.list({ ...params, limit: 20 }),
    enabled,
  });
}

/**
 * Cheap unread-count poll for the dashboard bell badge — `limit: 1` since
 * only `unreadCount` on the envelope is read, not the items themselves.
 */
export function useKitchenUnreadNotificationCount() {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.notificationsBadge,
    queryFn: () => kitchenNotificationsApi.list({ page: 1, limit: 1 }),
    enabled,
    refetchInterval: 30_000,
    select: (data) => data.unreadCount,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kitchenNotificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.notifications }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => kitchenNotificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.notifications }),
  });
}

// ── Payouts ───────────────────────────────────────────────────────────────

export function usePayoutSummary() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.payoutsSummary, queryFn: kitchenPayoutsApi.summary, enabled });
}

export function usePayoutTransactions(params: { page: number }) {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.payoutsList(params),
    queryFn: () => kitchenPayoutsApi.list({ ...params, limit: 20 }),
    enabled,
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => kitchenPayoutsApi.request(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.payoutsSummary });
      queryClient.invalidateQueries({ queryKey: ['kitchen', 'payouts', 'list'] });
    },
  });
}

// ── Operating Hours ───────────────────────────────────────────────────────

export function useOperatingHours() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.operatingHours, queryFn: kitchenOperatingHoursApi.get, enabled });
}

export function useUpdateWeeklyHours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dayOfWeek, input }: { dayOfWeek: DayOfWeek; input: UpdateWeeklyHoursInput }) =>
      kitchenOperatingHoursApi.updateDay(dayOfWeek, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.operatingHours }),
  });
}

export function useAddHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertHolidayInput) => kitchenOperatingHoursApi.addHoliday(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.operatingHours }),
  });
}

export function useRemoveHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => kitchenOperatingHoursApi.removeHoliday(date),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.operatingHours }),
  });
}

// ── Order Chat ────────────────────────────────────────────────────────────
// Polls at the same active-observer-only cadence as the other "live" queries
// in this file (see the FSSAI comment above) — it only refetches while the
// chat screen is actually mounted, no websockets on this backend.

export function useOrderMessages(orderId: string) {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.orderMessages(orderId),
    queryFn: () => kitchenOrderChatApi.list(orderId),
    enabled: enabled && !!orderId,
    refetchInterval: 12_000,
  });
}

export function useSendOrderMessage(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body, advanceToStatus }: { body: string; advanceToStatus?: OrderStatus }) =>
      kitchenOrderChatApi.send(orderId, body, advanceToStatus),
    onSuccess: (message) => {
      // Splice the confirmed message straight into the cache instead of
      // waiting for the next poll — keeps the thread from flickering.
      queryClient.setQueryData<OrderMessage[]>(kitchenKeys.orderMessages(orderId), (old) => (old ? [...old, message] : [message]));
      // A quick-reply can carry `advanceToStatus`, which moves the order —
      // keep the orders list and dashboard in sync either way.
      queryClient.invalidateQueries({ queryKey: kitchenKeys.orders });
      queryClient.invalidateQueries({ queryKey: kitchenKeys.dashboard });
    },
  });
}

// ── Reel Ads / Campaigns ──────────────────────────────────────────────────

export function useCampaigns(status?: CampaignStatus) {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.campaignsList(status),
    queryFn: () => kitchenAdsApi.list(status),
    enabled,
  });
}

export function useCampaignDetail(id: string) {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.campaignDetail(id),
    queryFn: () => kitchenAdsApi.get(id),
    enabled: enabled && !!id,
  });
}

/** `dailyBudgetRs` of `0`/`null` disables the query — nothing to estimate yet. */
export function useCampaignEstimate(dailyBudgetRs: number | null) {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.campaignEstimate(dailyBudgetRs ?? 0),
    queryFn: () => kitchenAdsApi.estimate(dailyBudgetRs as number),
    enabled: enabled && !!dailyBudgetRs && dailyBudgetRs > 0,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { reelId: string; dailyBudgetRs: number; durationDays: number }) => kitchenAdsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.campaigns });
      // The full cost was just charged from the wallet — keep the balance and ledger fresh.
      queryClient.invalidateQueries({ queryKey: kitchenKeys.wallet });
    },
  });
}

export function usePauseCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kitchenAdsApi.pause(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.campaigns }),
  });
}

export function useResumeCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kitchenAdsApi.resume(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.campaigns }),
  });
}

export function useStopCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kitchenAdsApi.stop(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.campaigns }),
  });
}

// ── Subscriptions (kitchen-facing) ────────────────────────────────────────

export function useSubscriptions(params: { status?: SubscriptionStatus; q?: string; page: number }) {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.subscriptionsList(params),
    queryFn: () => kitchenSubscriptionsApi.list({ ...params, limit: 20 }),
    enabled,
  });
}

export function useSubscriptionDetail(id: string) {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.subscriptionDetail(id),
    queryFn: () => kitchenSubscriptionsApi.get(id),
    enabled: enabled && !!id,
  });
}

export function useApproveSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kitchenSubscriptionsApi.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.subscriptions }),
  });
}

export function useRejectSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => kitchenSubscriptionsApi.reject(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.subscriptions }),
  });
}

export function usePauseSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kitchenSubscriptionsApi.pause(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.subscriptions }),
  });
}

export function useResumeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kitchenSubscriptionsApi.resume(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.subscriptions }),
  });
}

export function useDispatchDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => kitchenSubscriptionsApi.dispatchDelivery(id, date),
    onSuccess: (_result, variables) => queryClient.invalidateQueries({ queryKey: kitchenKeys.subscriptionDetail(variables.id) }),
  });
}

export function useSkipDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date, reason }: { id: string; date: string; reason?: string }) => kitchenSubscriptionsApi.skipDelivery(id, date, reason),
    onSuccess: (_result, variables) => queryClient.invalidateQueries({ queryKey: kitchenKeys.subscriptionDetail(variables.id) }),
  });
}

// ── Subscription Plans (kitchen-facing templates) ────────────────────────

export function useSubscriptionPlans() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.subscriptionPlans, queryFn: kitchenSubscriptionPlansApi.list, enabled });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubscriptionPlanInput) => kitchenSubscriptionPlansApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.subscriptionPlans }),
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSubscriptionPlanInput }) => kitchenSubscriptionPlansApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.subscriptionPlans }),
  });
}

// ── Kitchen Wallet ────────────────────────────────────────────────────────

export function useWalletSummary() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.walletSummary, queryFn: kitchenWalletApi.summary, enabled });
}

export function useWalletTransactions(params: { page: number }) {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.walletTransactions(params),
    queryFn: () => kitchenWalletApi.transactions({ ...params, limit: 20 }),
    enabled,
  });
}

export function useTopupWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amountRs: number) => kitchenWalletApi.topup(amountRs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.walletSummary });
      queryClient.invalidateQueries({ queryKey: ['kitchen', 'wallet', 'transactions'] });
    },
  });
}

// ── AI Optimization Suggestions ──────────────────────────────────────────

export function useSuggestions(params: { status?: CampaignSuggestionStatus; q?: string; page: number }) {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.suggestionsList(params),
    queryFn: () => kitchenSuggestionsApi.list({ ...params, limit: 20 }),
    enabled,
  });
}

export function useSuggestionDetail(id: string) {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.suggestionDetail(id),
    queryFn: () => kitchenSuggestionsApi.get(id),
    enabled: enabled && !!id,
  });
}

/**
 * Capped to once per kitchen per IST day server-side — calling again the
 * same day just re-returns the existing batch, which is why this doesn't
 * need any client-side "already generated today" guard. Can 503 when
 * Gemini is under load; callers should surface that as a retry-able error
 * state, not a crash.
 */
export function useGenerateSuggestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => kitchenSuggestionsApi.generate(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.suggestions }),
  });
}

export function useApplySuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kitchenSuggestionsApi.apply(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.suggestions });
      queryClient.invalidateQueries({ queryKey: kitchenKeys.suggestionDetail(id) });
      // A BUDGET_INCREASE/DELIVERY_RADIUS suggestion can mechanically change
      // a campaign — keep the campaigns list in sync too.
      queryClient.invalidateQueries({ queryKey: kitchenKeys.campaigns });
    },
  });
}

export function useDismissSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kitchenSuggestionsApi.dismiss(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.suggestions });
      queryClient.invalidateQueries({ queryKey: kitchenKeys.suggestionDetail(id) });
    },
  });
}

// ── Kitchen Premium Plans ─────────────────────────────────────────────────

export function usePremiumTiers() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.premiumTiers, queryFn: kitchenPremiumApi.tiers, enabled });
}

export function usePremiumSubscription() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.premiumSubscription, queryFn: kitchenPremiumApi.subscription, enabled });
}

export function usePurchasePremium() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tier: PremiumTier) => kitchenPremiumApi.purchase(tier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.premiumSubscription });
      // Purchase charges the wallet immediately.
      queryClient.invalidateQueries({ queryKey: kitchenKeys.wallet });
    },
  });
}
