import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogApi, homeApi, qk, storiesApi } from '@api';
import { useAuthGatedMutate } from '@features/authentication/hooks/useRequireAuth';

/** Everything above the Home meal feed, in a single request. */
export function useHomeFeed() {
  return useQuery({
    queryKey: qk.home.feed,
    queryFn: homeApi.feed,
    staleTime: 2 * 60_000,
  });
}

export function useSearchSuggestions() {
  return useQuery({
    queryKey: qk.home.suggestions,
    queryFn: homeApi.searchSuggestions,
    staleTime: 10 * 60_000,
  });
}

/** Style-of-food pills and cover-flow carousel. Barely changes — cached hard. */
export function useCuisines() {
  return useQuery({
    queryKey: qk.catalog.cuisines,
    queryFn: catalogApi.cuisines,
    staleTime: 60 * 60_000,
  });
}

/**
 * Kitchen Stories rail — scoped to the customer's own city, so a Jaipur
 * customer only ever sees Jaipur kitchens. Refetched fairly often since
 * stories are 24-hour ephemeral content.
 */
export function useKitchenStories(city?: string) {
  return useQuery({
    queryKey: qk.stories.feed(city),
    queryFn: () => storiesApi.feed(city),
    staleTime: 60_000,
  });
}

/** Fire-and-forget: marks a story watched and bumps the seen-ring off. */
export function useMarkStorySeen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storyId: string) => storiesApi.markSeen(storyId),
    onSuccess: () => {
      // Prefix match — the feed is cached per city, and only one is ever
      // mounted at a time, so invalidating every `stories` entry is simplest.
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

/**
 * The viewer keeps its own local like/count state (it's handed a snapshot via
 * navigation params, not a live query), so this only needs to return the
 * authoritative result to reconcile with — cache patching happens via the
 * broad `['stories']` invalidate, same as `useMarkStorySeen`.
 */
export function useToggleStoryLike() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (storyId: string) => storiesApi.toggleLike(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  const mutate = useAuthGatedMutate(mutation);
  return { ...mutation, mutate };
}

/** Fire-and-forget, called right after the native share sheet opens. */
export function useRegisterStoryShare() {
  return useMutation({
    mutationFn: (storyId: string) => storiesApi.registerShare(storyId),
  });
}
