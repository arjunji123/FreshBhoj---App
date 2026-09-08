import { create } from 'zustand';

interface AuthGateState {
  visible: boolean;
  /** Re-run automatically the moment login succeeds — e.g. the follow/favourite tap that opened the sheet. */
  pendingAction: (() => void) | null;
  request: (action?: () => void) => void;
  close: () => void;
  runPending: () => void;
}

/**
 * One global "please log in" bottom sheet, requested from anywhere a guest
 * hits a login-gated action (follow, favourite, checkout, ...). See
 * `useRequireAuth` for the call-site side of this.
 */
export const useAuthGateStore = create<AuthGateState>((set, get) => ({
  visible: false,
  pendingAction: null,
  request: (action) => set({ visible: true, pendingAction: action ?? null }),
  close: () => set({ visible: false, pendingAction: null }),
  runPending: () => {
    const { pendingAction } = get();
    set({ visible: false, pendingAction: null });
    pendingAction?.();
  },
}));
