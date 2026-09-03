import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk, reelsApi } from '@api';
import type { ReelFeedType } from '@api/endpoints/reels.api';
import type { Paginated, Reel } from '@api/types';

export function useReelFeed(feed: ReelFeedType = 'for_you', kitchenId?: string) {
  return useInfiniteQuery({
    queryKey: qk.reels.feed(feed, kitchenId),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      reelsApi.feed({ feed, kitchenId, page: pageParam as number, limit: 6 }),
    getNextPageParam: (lastPage: Paginated<Reel>) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    staleTime: 60_000,
  });
}

export function useSavedReels() {
  return useQuery({ queryKey: qk.reels.saved, queryFn: () => reelsApi.saved() });
}

/**
 * Likes update every cached page in place. A reel can appear in the For You
 * feed, a kitchen's feed and the saved list at once — patching the caches keeps
 * the heart consistent without refetching three lists.
 */
export function useToggleReelLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reelId: string) => reelsApi.toggleLike(reelId),
    onMutate: async (reelId) => {
      await queryClient.cancelQueries({ queryKey: qk.reels.all });
      patchReelCaches(queryClient, reelId, (reel) => ({
        ...reel,
        isLiked: !reel.isLiked,
        stats: {
          ...reel.stats,
          likes: reel.stats.likes + (reel.isLiked ? -1 : 1),
        },
      }));
    },
    onError: (_error, reelId) => {
      // Revert by flipping back; the next refetch reconciles exact counts.
      patchReelCaches(queryClient, reelId, (reel) => ({
        ...reel,
        isLiked: !reel.isLiked,
        stats: {
          ...reel.stats,
          likes: reel.stats.likes + (reel.isLiked ? -1 : 1),
        },
      }));
    },
  });
}

export function useToggleReelSave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reelId: string) => reelsApi.toggleSave(reelId),
    onMutate: async (reelId) => {
      await queryClient.cancelQueries({ queryKey: qk.reels.all });
      patchReelCaches(queryClient, reelId, (reel) => ({ ...reel, isSaved: !reel.isSaved }));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: qk.reels.saved }),
  });
}

/** Fire-and-forget: a dropped view ping is not worth surfacing to the user. */
export function recordReelView(reelId: string): void {
  reelsApi.recordView(reelId).catch(() => undefined);
}

export function recordReelShare(reelId: string): void {
  reelsApi.recordShare(reelId).catch(() => undefined);
}

function patchReelCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  reelId: string,
  updater: (reel: Reel) => Reel,
) {
  queryClient.setQueriesData({ queryKey: qk.reels.all }, (old: any) => {
    if (!old) return old;

    // Infinite queries store `pages`; the saved list is a plain Paginated.
    if (old.pages) {
      return {
        ...old,
        pages: old.pages.map((page: Paginated<Reel>) => ({
          ...page,
          items: page.items.map((reel) => (reel.id === reelId ? updater(reel) : reel)),
        })),
      };
    }

    if (old.items) {
      return {
        ...old,
        items: old.items.map((reel: Reel) => (reel.id === reelId ? updater(reel) : reel)),
      };
    }

    if (old.id === reelId) return updater(old);
    return old;
  });
}
