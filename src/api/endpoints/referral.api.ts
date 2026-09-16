import { apiClient } from '../client';
import type { ReferralSummary, RedeemReferralResult } from '../types';

export const referralApi = {
  me: () => apiClient.get<ReferralSummary>('/referral/me'),

  redeem: (code: string) => apiClient.post<RedeemReferralResult>('/referral/redeem', { code }),
};
