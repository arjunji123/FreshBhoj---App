import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, qk } from '@api';
import type { CustomerNotificationCategory, NotificationInbox } from '@api/types';
import { useAuthStore } from '@features/authentication/store/authStore';

const PAGE_SIZE = 20;

/** Unread badge for the Home bell. Cheap enough to re-check on a slow cadence. */
export function useUnreadNotificationCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: qk.notifications.unreadCount,
    queryFn: notificationsApi.unreadCount,
    enabled: Boolean(isAuthenticated),
    staleTime: 30_000,
    refetchInterval: 60_000,
    select: (data) => data.unreadCount,
  });
}

export function useNotificationInbox(category?: CustomerNotificationCategory) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useInfiniteQuery({
    queryKey: qk.notifications.inbox(category),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      notificationsApi.inbox({ page: pageParam as number, limit: PAGE_SIZE, category }),
    getNextPageParam: (lastPage: NotificationInbox) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled: Boolean(isAuthenticated),
    staleTime: 15_000,
  });
}

/** Clears the badge straight away; the inbox re-fetches so every row flips to read. */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.setQueryData(qk.notifications.unreadCount, { unreadCount: 0 });
      queryClient.invalidateQueries({ queryKey: qk.notifications.all });
    },
  });
}
