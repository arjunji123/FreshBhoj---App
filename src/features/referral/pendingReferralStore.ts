import { mmkv } from '@utils/mmkvStorage';

/**
 * Holds a referral code captured from a share link (`freshbhoj://refer/CODE`
 * or `https://freshbhoj.com/refer/CODE`) before the person has even signed up.
 * Raw MMKV, like tokenStore/onboardingStore — this needs to survive from
 * whenever the link is opened until the "were you referred?" onboarding step,
 * which can be several screens and an OTP verification later.
 */
const PENDING_CODE_KEY = 'referral.pendingCode';

export const pendingReferralStore = {
  set(code: string): void {
    mmkv.set(PENDING_CODE_KEY, code.trim().toUpperCase());
  },

  peek(): string | null {
    return mmkv.getString(PENDING_CODE_KEY) ?? null;
  },

  /** Reads and clears in one step — the onboarding step consumes it once. */
  consume(): string | null {
    const code = this.peek();
    if (code) mmkv.remove(PENDING_CODE_KEY);
    return code;
  },
};
