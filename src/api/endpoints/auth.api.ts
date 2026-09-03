import { apiClient } from '../client';
import type { AuthTokens, UserProfile, VerifyOtpResult } from '../types';

/** Backend validates with `IsMobilePhone('en-IN')`, which wants E.164. */
export const toE164 = (phone: string): string => {
  const digits = phone.replace(/\D/g, '').slice(-10);
  return `+91${digits}`;
};

export const authApi = {
  sendOtp: (phone: string) =>
    apiClient.post<{ expiresInMinutes: number; devOtp?: string }>(
      '/auth/otp/send',
      { phone: toE164(phone) },
      { skipAuth: true },
    ),

  verifyOtp: (phone: string, otp: string) =>
    apiClient.post<VerifyOtpResult>(
      '/auth/otp/verify',
      { phone: toE164(phone), otp },
      { skipAuth: true },
    ),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthTokens>('/auth/token/refresh', { refreshToken }, { skipAuth: true }),

  logout: (refreshToken?: string) => apiClient.post<null>('/auth/logout', { refreshToken }),

  me: () => apiClient.get<UserProfile>('/auth/me'),
};

export const usersApi = {
  profile: () => apiClient.get<UserProfile>('/customer/profile'),

  /**
   * Multipart because the profile photo rides along. The boundary header is set
   * by fetch itself — `apiClient` deliberately omits Content-Type for FormData.
   */
  completeProfile: (input: {
    fullName: string;
    email?: string;
    profileImage?: { uri: string; name: string; type: string };
  }) => {
    const form = new FormData();
    form.append('fullName', input.fullName);
    if (input.email) form.append('email', input.email);
    if (input.profileImage) form.append('profileImage', input.profileImage as any);
    return apiClient.post<UserProfile>('/customer/profile/complete', form);
  },

  updateLocation: (input: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) => apiClient.patch<UserProfile>('/customer/profile/location', input),

  updateFcmToken: (fcmToken: string) =>
    apiClient.patch<null>('/customer/profile/fcm-token', { fcmToken }),
};
