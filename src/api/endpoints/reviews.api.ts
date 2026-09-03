import { apiClient } from '../client';
import type { PendingReviewPrompt, Review } from '../types';

export interface CreateReviewInput {
  rating: number;
  orderId?: string;
  mealId?: string;
  comment?: string;
  photos?: string[];
  tags?: string[];
}

export const reviewsApi = {
  create: (kitchenId: string, input: CreateReviewInput) =>
    apiClient.post<Review>(`/customer/reviews/kitchens/${kitchenId}`, input),

  pending: () => apiClient.get<PendingReviewPrompt[]>('/customer/reviews/pending'),

  markHelpful: (reviewId: string) =>
    apiClient.post<{ id: string; likeCount: number }>(`/customer/reviews/${reviewId}/helpful`),
};
