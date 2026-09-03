import { useMutation } from '@tanstack/react-query';
import { authApi, catalogApi, usersApi } from '@api';
import { useAuthStore } from '../store/authStore';

export function useSendOtp() {
  return useMutation({ mutationFn: (phone: string) => authApi.sendOtp(phone) });
}

/** Verifies the code, then stores tokens and decides where the user lands. */
export function useVerifyOtp() {
  const signIn = useAuthStore((s) => s.signIn);

  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) => authApi.verifyOtp(phone, otp),
    onSuccess: (result) => {
      signIn({
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        user: result.user,
        isNewUser: result.isNewUser,
      });
    },
  });
}

/** Final onboarding step — completing the profile flips the navigation gate. */
export function useCompleteProfile() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: usersApi.completeProfile,
    onSuccess: (user) => setUser(user),
  });
}

export function useSaveOnboardingLocation() {
  const setLocation = useAuthStore((s) => s.setLocation);
  const setisAuthenticated = useAuthStore((s) => s.setisAuthenticated);

  return useMutation({
    mutationFn: usersApi.updateLocation,
    onSuccess: (user) => {
      setLocation({
        address: user.address ?? '',
        latitude: user.latitude ?? 0,
        longitude: user.longitude ?? 0,
        city: user.city ?? 'Jaipur',
      });
      // Location is the last onboarding step; the user is fully set up now.
      setisAuthenticated(true);
    },
  });
}

export function useServiceableAreas(search?: string) {
  return useMutation({ mutationFn: () => catalogApi.areas({ q: search, city: 'Jaipur' }) });
}
