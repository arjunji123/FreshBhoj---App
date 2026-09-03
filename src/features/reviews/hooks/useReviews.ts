import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk, reviewsApi } from '@api';
import type { CreateReviewInput } from '@api/endpoints/reviews.api';
import { useAuthStore } from '@features/authentication/store/authStore';

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

  return useMutation({
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
}

export function useMarkReviewHelpful() {
  return useMutation({ mutationFn: (reviewId: string) => reviewsApi.markHelpful(reviewId) });
}
