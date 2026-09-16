import { createMMKV } from 'react-native-mmkv';

/**
 * A fully separate MMKV instance from the customer session — a phone is
 * either signed in as a kitchen or as a customer, never both, but keeping
 * the storage physically isolated (not just key-namespaced) means signing
 * out of one can never accidentally touch the other.
 */
const kitchenMmkv = createMMKV({ id: 'freshbhoj-kitchen-storage' });

const ACCESS_TOKEN_KEY = 'kitchenAuth.accessToken';
const REFRESH_TOKEN_KEY = 'kitchenAuth.refreshToken';

export const kitchenTokenStore = {
  getAccessToken(): string | null {
    return kitchenMmkv.getString(ACCESS_TOKEN_KEY) ?? null;
  },

  getRefreshToken(): string | null {
    return kitchenMmkv.getString(REFRESH_TOKEN_KEY) ?? null;
  },

  setTokens(accessToken: string, refreshToken: string): void {
    kitchenMmkv.set(ACCESS_TOKEN_KEY, accessToken);
    kitchenMmkv.set(REFRESH_TOKEN_KEY, refreshToken);
  },

  clear(): void {
    kitchenMmkv.remove(ACCESS_TOKEN_KEY);
    kitchenMmkv.remove(REFRESH_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(kitchenMmkv.getString(ACCESS_TOKEN_KEY));
  },
};

export const kitchenMmkvZustandStorage = {
  getItem: (name: string) => kitchenMmkv.getString(name) ?? null,
  setItem: (name: string, value: string) => kitchenMmkv.set(name, value),
  removeItem: (name: string) => kitchenMmkv.remove(name),
};
