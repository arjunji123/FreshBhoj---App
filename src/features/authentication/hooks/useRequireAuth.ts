import { useCallback } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useAuthGateStore } from '../store/authGateStore';

/**
 * Gate any action behind login — used for follow, favourite, checkout, and
 * anywhere else a guest needs an account first. Logged-in users run the
 * action immediately; a guest sees the login sheet, and the action re-runs
 * on its own the moment login succeeds.
 *
 * Returns `true` if the action ran immediately, `false` if it was deferred
 * behind the login sheet.
 */
export function useRequireAuth() {
  return useCallback((action?: () => void) => {
    if (useAuthStore.getState().isAuthenticated) {
      action?.();
      return true;
    }
    useAuthGateStore.getState().request(action);
    return false;
  }, []);
}

/**
 * Wraps a mutation's `mutate` so a guest sees the login sheet instead of
 * firing a call that would just 401 (and, worse, trip the global
 * session-expired handler). The mutation re-runs on its own, on the same
 * screen, the moment login succeeds — see `useToggleFollowKitchen` /
 * `useToggleFavorite` for the pattern this generalizes.
 */
export function useAuthGatedMutate<TData, TError, TVariables, TContext>(
  mutation: Pick<UseMutationResult<TData, TError, TVariables, TContext>, 'mutate'>,
): UseMutationResult<TData, TError, TVariables, TContext>['mutate'] {
  const requireAuth = useRequireAuth();

  return useCallback(
    (variables: TVariables, options?: Parameters<typeof mutation.mutate>[1]) =>
      requireAuth(() => mutation.mutate(variables, options)),
    [requireAuth, mutation],
  ) as UseMutationResult<TData, TError, TVariables, TContext>['mutate'];
}
