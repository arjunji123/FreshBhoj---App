import { mmkv } from '@utils/mmkvStorage';

/**
 * Whether the user has ever finished the 3-slide intro. Kept in raw MMKV
 * (like tokenStore) rather than the auth Zustand store so it survives
 * `signOut()` — once seen, it should never come back, logged in or not.
 */
const HAS_SEEN_ONBOARDING_KEY = 'onboarding.hasSeenOnboarding';

export const onboardingStore = {
  hasSeenOnboarding(): boolean {
    return mmkv.getBoolean(HAS_SEEN_ONBOARDING_KEY) ?? false;
  },

  markSeen(): void {
    mmkv.set(HAS_SEEN_ONBOARDING_KEY, true);
  },
};
