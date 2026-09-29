import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk, walletApi } from '@api';
import type { Paginated, WalletTransaction, WalletWithdrawal } from '@api/types';
import { useAuthStore } from '@features/authentication/store/authStore';
import { useAuthGatedMutate } from '@features/authentication/hooks/useRequireAuth';

export function useWalletSummary() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: qk.wallet.summary,
    queryFn: walletApi.getSummary,
    enabled: Boolean(isAuthenticated),
  });
}

export function useWalletTransactions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useInfiniteQuery({
    queryKey: qk.wallet.transactions,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => walletApi.listTransactions(pageParam as number),
    getNextPageParam: (lastPage: Paginated<WalletTransaction>) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled: Boolean(isAuthenticated),
  });
}

export function useWalletWithdrawals() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useInfiniteQuery({
    queryKey: qk.wallet.withdrawals,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => walletApi.listWithdrawals(pageParam as number),
    getNextPageParam: (lastPage: Paginated<WalletWithdrawal>) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled: Boolean(isAuthenticated),
  });
}

/** Completes instantly — same placeholder top-up idiom as every other payment surface in this app. */
export function useTopUpWallet() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (amountRs: number) => walletApi.topUp(amountRs),
    onSuccess: (result) => {
      queryClient.setQueryData(qk.wallet.summary, result.wallet);
      queryClient.invalidateQueries({ queryKey: qk.wallet.transactions });
    },
  });

  const mutate = useAuthGatedMutate(mutation);
  return { ...mutation, mutate };
}

/** Genuinely waits on ops — comes back `REQUESTED`, not an instant success. */
export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ amountRs, destination }: { amountRs: number; destination: Record<string, string> }) =>
      walletApi.requestWithdrawal(amountRs, destination),
    onSuccess: () => {
      // The requested amount is reserved (debited) immediately server-side.
      queryClient.invalidateQueries({ queryKey: qk.wallet.summary });
      queryClient.invalidateQueries({ queryKey: qk.wallet.withdrawals });
    },
  });

  const mutate = useAuthGatedMutate(mutation);
  return { ...mutation, mutate };
}
