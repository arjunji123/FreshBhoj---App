import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentMethodsApi, qk } from '@api';
import { useAuthStore } from '@features/authentication/store/authStore';
import { useAuthGatedMutate } from '@features/authentication/hooks/useRequireAuth';

// ── Saved cards ──────────────────────────────────────────────────────────────
// Read/select/remove only — see `PaymentMethods.tsx` for why "Add Card" can't
// actually save one yet (no client-side gateway SDK in this app).

export function useSavedCards() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: qk.paymentMethods.cards,
    queryFn: paymentMethodsApi.listCards,
    enabled: Boolean(isAuthenticated),
  });
}

export function useSetDefaultCard() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => paymentMethodsApi.setDefaultCard(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.paymentMethods.cards }),
  });

  const mutate = useAuthGatedMutate(mutation);
  return { ...mutation, mutate };
}

export function useRemoveCard() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => paymentMethodsApi.removeCard(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.paymentMethods.cards }),
  });

  const mutate = useAuthGatedMutate(mutation);
  return { ...mutation, mutate };
}

// ── UPI IDs ──────────────────────────────────────────────────────────────────
// Fully real — every action here actually persists.

export function useUpiMethods() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: qk.paymentMethods.upi,
    queryFn: paymentMethodsApi.listUpi,
    enabled: Boolean(isAuthenticated),
  });
}

export function useAddUpi() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: { vpa: string; label?: string; isDefault?: boolean }) =>
      paymentMethodsApi.addUpi(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.paymentMethods.upi }),
  });

  const mutate = useAuthGatedMutate(mutation);
  return { ...mutation, mutate };
}

export function useSetDefaultUpi() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => paymentMethodsApi.setDefaultUpi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.paymentMethods.upi }),
  });

  const mutate = useAuthGatedMutate(mutation);
  return { ...mutation, mutate };
}

export function useRemoveUpi() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => paymentMethodsApi.removeUpi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.paymentMethods.upi }),
  });

  const mutate = useAuthGatedMutate(mutation);
  return { ...mutation, mutate };
}
