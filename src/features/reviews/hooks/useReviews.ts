import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { qk, reviewsApi } from '@api';
import type { CreateReviewInput } from '@api/endpoints/reviews.api';
import type { Review } from '@api/types';
import { useAuthStore } from '@features/authentication/store/authStore';
import { useAuthGatedMutate } from '@features/authentication/hooks/useRequireAuth';

/** Delivered orders the user hasn't rated — powers the Order History prompt. */
export function usePendingReviews() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: qk.reviews.pending,
    queryFn: reviewsApi.pending,
    enabled: Boolean(isAuthenticated),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ kitchenId, input }: { kitchenId: string; input: CreateReviewInput }) =>
      reviewsApi.create(kitchenId, input),
    onSuccess: (_review, { kitchenId }) => {
      queryClient.invalidateQueries({ queryKey: qk.kitchens.reviews(kitchenId) });
      queryClient.invalidateQueries({ queryKey: qk.kitchens.reviewSummary(kitchenId) });
      queryClient.invalidateQueries({ queryKey: qk.kitchens.detail(kitchenId) });
      queryClient.invalidateQueries({ queryKey: qk.reviews.pending });
      queryClient.invalidateQueries({ queryKey: qk.orders.all });
    },
  });

  const mutate = useAuthGatedMutate(mutation);
  return { ...mutation, mutate };
}

/** Every cached review list — kitchen and meal — is a `{ items: Review[] }` page. */
function isReviewListQuery(query: { queryKey: QueryKey }): boolean {
  return query.queryKey.includes('reviews');
}

function patchReview(
  data: unknown,
  reviewId: string,
  patch: Partial<Pick<Review, 'isHelpful' | 'likeCount'>>,
): unknown {
  if (!data || typeof data !== 'object' || !('items' in data)) return data;
  const paginated = data as { items: Review[] };
  return {
    ...paginated,
    items: paginated.items.map((review) =>
      review.id === reviewId ? { ...review, ...patch } : review,
    ),
  };
}

/**
 * A real toggle, not a one-way counter — the heart re-tap is what tells the
 * user their tap registered. Patches every cached review list (kitchen and
 * meal pages both hold their own copy of the same review) so the count and
 * active state stay in sync wherever that review is shown.
 */
export function useMarkReviewHelpful() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (reviewId: string) => reviewsApi.markHelpful(reviewId),
    onMutate: async (reviewId) => {
      await queryClient.cancelQueries({ predicate: isReviewListQuery });
      const previousQueries = queryClient.getQueriesData({ predicate: isReviewListQuery });

      previousQueries.forEach(([key, data]) => {
        const paginated = data as { items: Review[] } | undefined;
        const current = paginated?.items.find((review) => review.id === reviewId);
        if (!current) return;

        const nextIsHelpful = !current.isHelpful;
        queryClient.setQueryData(
          key,
          patchReview(data, reviewId, {
            isHelpful: nextIsHelpful,
            likeCount: current.likeCount + (nextIsHelpful ? 1 : -1),
          }),
        );
      });

      return { previousQueries };
    },
    onError: (_error, _reviewId, context) => {
      context?.previousQueries?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSuccess: (result, reviewId) => {
      // Reconcile with the server's authoritative count once it's back.
      queryClient.getQueriesData({ predicate: isReviewListQuery }).forEach(([key, data]) => {
        queryClient.setQueryData(
          key,
          patchReview(data, reviewId, { isHelpful: result.isHelpful, likeCount: result.likeCount }),
        );
      });
    },
  });

  const mutate = useAuthGatedMutate(mutation);
  return { ...mutation, mutate };
}
