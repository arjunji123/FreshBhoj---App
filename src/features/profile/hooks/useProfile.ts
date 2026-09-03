import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressesApi, authApi, qk, supportApi, usersApi } from '@api';
import type { AddressInput } from '@api/endpoints/addresses.api';
import type { NotificationPreferences } from '@api/types';
import { useAuthStore } from '@features/authentication/store/authStore';

// ── Profile ─────────────────────────────────────────────────────────────────

export function useProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: qk.user.me,
    queryFn: async () => {
      const user = await usersApi.profile();
      // Keep the persisted store in step so the header renders instantly on
      // next launch, before this query resolves.
      setUser(user);
      return user;
    },
    enabled: Boolean(isAuthenticated),
  });
}

export function useProfileStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: qk.support.profileStats,
    queryFn: supportApi.profileStats,
    enabled: Boolean(isAuthenticated),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: usersApi.completeProfile,
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(qk.user.me, user);
    },
  });
}

export function useLogout() {
  const signOut = useAuthStore((s) => s.signOut);

  return useMutation({
    // Revoking server-side is best-effort: the local session must clear even if
    // the device is offline, otherwise the user is stuck signed in.
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch {
        // Ignored by design.
      }
    },
    onSettled: () => signOut(),
  });
}

// ── Addresses ───────────────────────────────────────────────────────────────

export function useAddresses() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: qk.addresses.list,
    queryFn: addressesApi.list,
    enabled: Boolean(isAuthenticated),
  });
}

export function useDefaultAddress() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: qk.addresses.default,
    queryFn: addressesApi.getDefault,
    enabled: Boolean(isAuthenticated),
  });
}

function useAddressMutationOptions() {
  const queryClient = useQueryClient();
  return {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.addresses.all });
      queryClient.invalidateQueries({ queryKey: qk.support.profileStats });
    },
  };
}

export function useCreateAddress() {
  const options = useAddressMutationOptions();
  return useMutation({ mutationFn: (input: AddressInput) => addressesApi.create(input), ...options });
}

export function useUpdateAddress() {
  const options = useAddressMutationOptions();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AddressInput> }) =>
      addressesApi.update(id, input),
    ...options,
  });
}

export function useSetDefaultAddress() {
  const options = useAddressMutationOptions();
  return useMutation({ mutationFn: (id: string) => addressesApi.setDefault(id), ...options });
}

export function useDeleteAddress() {
  const options = useAddressMutationOptions();
  return useMutation({ mutationFn: (id: string) => addressesApi.remove(id), ...options });
}

// ── Support & settings ──────────────────────────────────────────────────────

export function useSupportContact() {
  return useQuery({
    queryKey: qk.support.contact,
    queryFn: supportApi.contact,
    staleTime: 60 * 60_000,
  });
}

export function useFaqs(category?: string) {
  return useQuery({
    queryKey: qk.support.faqs(category),
    queryFn: () => supportApi.faqs(category),
    staleTime: 30 * 60_000,
  });
}

export function useNotificationPreferences() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: qk.support.notificationPreferences,
    queryFn: supportApi.notificationPreferences,
    enabled: Boolean(isAuthenticated),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<NotificationPreferences>) =>
      supportApi.updateNotificationPreferences(input),
    onMutate: async (input) => {
      // Switches must respond on tap, not after a round-trip.
      await queryClient.cancelQueries({ queryKey: qk.support.notificationPreferences });
      const previous = queryClient.getQueryData(qk.support.notificationPreferences);
      queryClient.setQueryData(qk.support.notificationPreferences, (old: any) =>
        old ? { ...old, ...input } : old,
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.support.notificationPreferences, context.previous);
      }
    },
  });
}
