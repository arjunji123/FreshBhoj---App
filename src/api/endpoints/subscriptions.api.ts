import { apiClient } from '../client';
import type {
  CreateBespokeSubscriptionInput,
  CreateSubscriptionFromPlanInput,
  CustomerSubscription,
  CustomerSubscriptionDetail,
  CustomerSubscriptionSummary,
  SubscriptionDeliveryEntry,
  SubscriptionQuoteInput,
  SubscriptionQuoteResult,
} from '../types';

export const subscriptionsApi = {
  /**
   * Plan-based subscription request — the only shape this app currently
   * sends. `planName`/`mealsPerDay`/`deliveryDays`/`billingCycle` are derived
   * server-side from `planId` and must not be included here. Always comes
   * back `PENDING`; the kitchen still has to approve it.
   */
  createFromPlan: (input: CreateSubscriptionFromPlanInput) =>
    apiClient.post<CustomerSubscription>('/customer/subscriptions', input),

  /**
   * Bespoke Setup Plan wizard — every term is freely chosen, no `planId`.
   * Same endpoint as `createFromPlan`, disambiguated by the absence of a
   * plan id. Always comes back `PENDING`.
   */
  createBespoke: (input: CreateBespokeSubscriptionInput) =>
    apiClient.post<CustomerSubscription>('/customer/subscriptions', input),

  /**
   * Server-computed price preview for the wizard's Review step — never trust
   * a client-computed total. POST despite being read-only, so `deliveryDays`
   * can travel in the body instead of a repeated query string.
   */
  quote: (input: SubscriptionQuoteInput) =>
    apiClient.post<SubscriptionQuoteResult>('/customer/subscriptions/quote', input),

  /** Every subscription the customer has ever requested — every status. */
  list: () => apiClient.get<CustomerSubscriptionSummary[]>('/customer/subscriptions'),

  detail: (id: string) => apiClient.get<CustomerSubscriptionDetail>(`/customer/subscriptions/${id}`),

  /** Omit `days` for an indefinite pause (matches the kitchen-side pause semantics). */
  pause: (id: string, days?: number) =>
    apiClient.post<CustomerSubscriptionDetail>(
      `/customer/subscriptions/${id}/pause`,
      days ? { days } : undefined,
    ),

  resume: (id: string) =>
    apiClient.post<CustomerSubscriptionDetail>(`/customer/subscriptions/${id}/resume`),

  /** Vacation mode — pauses every active subscription at once. `days` is required (1-90). */
  pauseAll: (days: number) =>
    apiClient.post<{ pausedCount: number; pausedUntil: string }>(
      '/customer/subscriptions/pause-all',
      { days },
    ),

  /** `date` must already be `YYYY-MM-DD` — slice an ISO `deliverySchedule[].date` before calling. */
  swapMeal: (id: string, date: string, mealId: string) =>
    apiClient.post<SubscriptionDeliveryEntry>(
      `/customer/subscriptions/${id}/deliveries/${date}/meal`,
      { mealId },
    ),
};
