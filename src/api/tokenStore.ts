import { mmkv } from '@utils/mmkvStorage';

/**
 * Auth tokens live here rather than in the Zustand store so `apiClient` can read
 * and rotate them without importing a store that itself imports the client.
 * MMKV is synchronous, which means the request interceptor never awaits.
 */
const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';

export const tokenStore = {
  getAccessToken(): string | null {
    return mmkv.getString(ACCESS_TOKEN_KEY) ?? null;
  },

  getRefreshToken(): string | null {
    return mmkv.getString(REFRESH_TOKEN_KEY) ?? null;
  },

  setTokens(accessToken: string, refreshToken: string): void {
    mmkv.set(ACCESS_TOKEN_KEY, accessToken);
    mmkv.set(REFRESH_TOKEN_KEY, refreshToken);
  },

  clear(): void {
    mmkv.remove(ACCESS_TOKEN_KEY);
    mmkv.remove(REFRESH_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(mmkv.getString(ACCESS_TOKEN_KEY));
  },
};
