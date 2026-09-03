import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogApi, homeApi, qk, storiesApi } from '@api';

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

/** Goal chips. Cached hard — this list barely changes. */
export function useGoalTags() {
  return useQuery({
    queryKey: qk.catalog.goalTags,
    queryFn: catalogApi.goalTags,
    staleTime: 60 * 60_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: qk.catalog.categories,
    queryFn: catalogApi.categories,
    staleTime: 60 * 60_000,
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
