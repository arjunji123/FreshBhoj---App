import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { kitchensApi, qk } from '@api';
import type { KitchenListParams } from '@api/endpoints/kitchens.api';
import type { KitchenCard, Paginated } from '@api/types';

export function useKitchens(params: KitchenListParams = {}) {
  return useInfiniteQuery({
    queryKey: qk.kitchens.list(params as Record<string, unknown>),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => kitchensApi.list({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage: Paginated<KitchenCard>) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    staleTime: 2 * 60_000,
  });
}

export function useKitchen(idOrSlug: string) {
  return useQuery({
    queryKey: qk.kitchens.detail(idOrSlug),
    queryFn: () => kitchensApi.detail(idOrSlug),
    enabled: Boolean(idOrSlug),
  });
}

export function useKitchenMedia(kitchenId: string) {
  return useQuery({
    queryKey: qk.kitchens.media(kitchenId),
    queryFn: () => kitchensApi.media(kitchenId),
    enabled: Boolean(kitchenId),
    staleTime: 5 * 60_000,
  });
}

export function useKitchenMenu(kitchenId: string) {
  return useQuery({
    queryKey: qk.kitchens.menu(kitchenId),
    queryFn: () => kitchensApi.menu(kitchenId, { limit: 40 }),
    enabled: Boolean(kitchenId),
  });
}

export function useKitchenReviews(kitchenId: string, limit = 10) {
  return useQuery({
    queryKey: [...qk.kitchens.reviews(kitchenId), limit],
    queryFn: () => kitchensApi.reviews(kitchenId, { limit }),
    enabled: Boolean(kitchenId),
  });
}

export function useKitchenReviewSummary(kitchenId: string) {
  return useQuery({
    queryKey: qk.kitchens.reviewSummary(kitchenId),
    queryFn: () => kitchensApi.reviewSummary(kitchenId),
    enabled: Boolean(kitchenId),
  });
}

export function useFollowedKitchens() {
  return useQuery({ queryKey: qk.kitchens.following, queryFn: () => kitchensApi.following() });
}

/** Optimistic follow so the button flips the instant it's tapped. */
export function useToggleFollowKitchen(kitchenId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => kitchensApi.toggleFollow(kitchenId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: qk.kitchens.detail(kitchenId) });
      const previous = queryClient.getQueryData(qk.kitchens.detail(kitchenId));

      queryClient.setQueryData(qk.kitchens.detail(kitchenId), (old: any) =>
        old
          ? {
              ...old,
              isFollowing: !old.isFollowing,
              followerCount: old.followerCount + (old.isFollowing ? -1 : 1),
            }
          : old,
      );

      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.kitchens.detail(kitchenId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.kitchens.detail(kitchenId) });
      queryClient.invalidateQueries({ queryKey: qk.kitchens.following });
    },
  });
}
