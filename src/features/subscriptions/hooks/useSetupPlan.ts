import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk, subscriptionsApi } from '@api';
import type { CreateBespokeSubscriptionInput, SubscriptionQuoteInput } from '@api/types';
import { useAuthGatedMutate } from '@features/authentication/hooks/useRequireAuth';

/**
 * Server-computed price preview for the Setup Plan wizard's Review step.
 * Re-fetches whenever the caller's `input` changes (meals/day, delivery
 * days, billing cycle, payment method, requested coins) — never trust a
 * client-computed subscription price.
 */
export function useSubscriptionQuote(input: SubscriptionQuoteInput, enabled: boolean) {
  return useQuery({
    queryKey: qk.subscriptions.quote(input as unknown as Record<string, unknown>),
    queryFn: () => subscriptionsApi.quote(input),
    enabled,
    staleTime: 10_000,
  });
}

/**
 * "Confirm & Pay" on the wizard's Review step. Requires a real account, same
 * gating as `useSubscribeToPlan`. The hub screen's own list query picks up
 * the new subscription through its own invalidation — this only needs to
 * refresh the wallet balance, since a WALLET-paid request debits it
 * server-side as part of creation.
 */
export function useCreateBespokeSubscription() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: CreateBespokeSubscriptionInput) => subscriptionsApi.createBespoke(input),
    onSuccess: (_subscription, variables) => {
      if (variables.paymentMethod === 'WALLET') {
        queryClient.invalidateQueries({ queryKey: qk.wallet.summary });
        queryClient.invalidateQueries({ queryKey: qk.wallet.transactions });
      }
    },
  });

  const mutate = useAuthGatedMutate(mutation);
  return { ...mutation, mutate };
}
