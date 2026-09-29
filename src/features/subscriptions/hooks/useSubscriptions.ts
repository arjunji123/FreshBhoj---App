import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk, subscriptionsApi } from '@api';
import { useAuthStore } from '@features/authentication/store/authStore';

/** The customer's own subscriptions — every status, newest request first (as the backend orders them). */
export function useCustomerSubscriptions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: qk.subscriptions.list,
    queryFn: () => subscriptionsApi.list(),
    enabled: Boolean(isAuthenticated),
  });
}

export function useSubscriptionDetail(subscriptionId: string) {
  return useQuery({
    queryKey: qk.subscriptions.detail(subscriptionId),
    queryFn: () => subscriptionsApi.detail(subscriptionId),
    enabled: Boolean(subscriptionId),
  });
}

/** Omit `days` for an indefinite pause. */
export function usePauseSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, days }: { id: string; days?: number }) => subscriptionsApi.pause(id, days),
    onSuccess: (detail, variables) => {
      queryClient.setQueryData(qk.subscriptions.detail(variables.id), detail);
      queryClient.invalidateQueries({ queryKey: qk.subscriptions.all });
    },
  });
}

export function useResumeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) => subscriptionsApi.resume(subscriptionId),
    onSuccess: (detail, subscriptionId) => {
      queryClient.setQueryData(qk.subscriptions.detail(subscriptionId), detail);
      queryClient.invalidateQueries({ queryKey: qk.subscriptions.all });
    },
  });
}

/** Vacation mode — pauses every active subscription at once. */
export function useBulkPauseSubscriptions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (days: number) => subscriptionsApi.pauseAll(days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.subscriptions.all });
    },
  });
}

export function useSwapDeliveryMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      date,
      mealId,
    }: {
      subscriptionId: string;
      /** `YYYY-MM-DD` — already sliced from the delivery's ISO date. */
      date: string;
      mealId: string;
    }) => subscriptionsApi.swapMeal(subscriptionId, date, mealId),
    onSuccess: (_delivery, variables) => {
      queryClient.invalidateQueries({ queryKey: qk.subscriptions.detail(variables.subscriptionId) });
    },
  });
}
