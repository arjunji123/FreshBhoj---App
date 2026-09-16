import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk, referralApi } from '@api';
import { useAuthStore } from '@features/authentication/store/authStore';

export function useReferralSummary() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: qk.referral.me,
    queryFn: referralApi.me,
    enabled: Boolean(isAuthenticated),
  });
}

export function useRedeemReferral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => referralApi.redeem(code),
    onSuccess: (data) => {
      queryClient.setQueryData(qk.referral.me, data);
    },
  });
}
