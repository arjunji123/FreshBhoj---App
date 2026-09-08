import { useCallback } from 'react';
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
