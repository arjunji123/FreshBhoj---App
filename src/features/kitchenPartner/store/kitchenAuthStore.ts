import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { queryClient } from '@api';
import { kitchenMmkvZustandStorage, kitchenTokenStore } from '../api/kitchenTokenStore';
import { setKitchenSessionExpiredHandler } from '../api/kitchenClient';
import type { KitchenAccount, KitchenTokenPair } from '../kitchenPartner.types';

interface KitchenAuthState {
  isAuthenticated: boolean;
  account: KitchenAccount | null;
  signIn: (payload: { account: KitchenAccount; tokens: KitchenTokenPair }) => void;
  setAccount: (account: KitchenAccount) => void;
  signOut: () => void;
}

const initialState = {
  isAuthenticated: false,
  account: null as KitchenAccount | null,
};

export const useKitchenAuthStore = create<KitchenAuthState>()(
  persist(
    (set) => ({
      ...initialState,

      signIn: ({ account, tokens }) => {
        kitchenTokenStore.setTokens(tokens.accessToken, tokens.refreshToken);
        set({ account, isAuthenticated: true });
      },

      setAccount: (account) => set({ account }),

      signOut: () => {
        kitchenTokenStore.clear();
        // Cached dashboard/orders/menu/stories belong to the previous kitchen.
        queryClient.clear();
        set({ ...initialState });
      },
    }),
    {
      name: 'kitchen-auth-store',
      storage: createJSONStorage(() => kitchenMmkvZustandStorage),
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated, account: state.account }),
      onRehydrateStorage: () => (state) => {
        // The token pair lives outside this store (see kitchenTokenStore) —
        // if it's gone but persisted state says authenticated, the tokens
        // were cleared elsewhere (e.g. a hard 401) and this is stale.
        if (state?.isAuthenticated && !kitchenTokenStore.isAuthenticated()) {
          queryClient.clear();
          useKitchenAuthStore.setState({ ...initialState });
        }
      },
    },
  ),
);

setKitchenSessionExpiredHandler(() => {
  useKitchenAuthStore.getState().signOut();
});
