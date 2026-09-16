import { useMutation } from '@tanstack/react-query';
import { toE164 } from '@api/endpoints/auth.api';
import { kitchenAuthApi } from '../api/kitchenPortal.api';
import { useKitchenAuthStore } from '../store/kitchenAuthStore';

export function useSendKitchenOtp() {
  return useMutation({ mutationFn: (phone: string) => kitchenAuthApi.sendOtp(toE164(phone)) });
}

export function useVerifyKitchenOtp() {
  const signIn = useKitchenAuthStore((s) => s.signIn);

  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) => kitchenAuthApi.verifyOtp(toE164(phone), otp),
    onSuccess: (result) => signIn({ account: result.account, tokens: result.tokens }),
  });
}

export function useKitchenLogout() {
  const signOut = useKitchenAuthStore((s) => s.signOut);

  return useMutation({
    mutationFn: () => kitchenAuthApi.logout(),
    onSettled: () => signOut(),
  });
}
