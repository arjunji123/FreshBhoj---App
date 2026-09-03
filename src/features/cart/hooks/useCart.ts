import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, cartApi, couponsApi, qk } from '@api';
import type { AddCartItemInput } from '@api/endpoints/cart.api';
import type { Cart } from '@api/types';
import { useAuthStore } from '@features/authentication/store/authStore';

/** Full cart with server-computed pricing and checkout blockers. */
export function useCart() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: qk.cart.detail,
    queryFn: cartApi.get,
    enabled: Boolean(isAuthenticated),
    staleTime: 0, // Prices and availability change under us; always refetch.
  });
}

/** Lightweight count for the nav badge and the floating cart bar. */
export function useCartCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: qk.cart.count,
    queryFn: cartApi.count,
    enabled: Boolean(isAuthenticated),
    staleTime: 15_000,
  });
}

/**
 * Every cart mutation returns the whole cart, so we seed the cache with the
 * response instead of refetching — the cart screen updates in one round-trip.
 */
function useCartMutationOptions() {
  const queryClient = useQueryClient();

  return {
    onSuccess: (cart: Cart) => {
      queryClient.setQueryData(qk.cart.detail, cart);
      queryClient.setQueryData(qk.cart.count, {
        itemCount: cart.itemCount,
        lineCount: cart.items.length,
      });
    },
  };
}

export function useAddToCart() {
  const options = useCartMutationOptions();

  return useMutation({
    mutationFn: (input: AddCartItemInput) => cartApi.addItem(input),
    ...options,
  });
}

export function useUpdateCartItem() {
  const options = useCartMutationOptions();

  return useMutation({
    mutationFn: ({
      itemId,
      quantity,
      specialInstructions,
    }: {
      itemId: string;
      quantity: number;
      specialInstructions?: string;
    }) => cartApi.updateItem(itemId, { quantity, specialInstructions }),
    ...options,
  });
}

export function useRemoveCartItem() {
  const options = useCartMutationOptions();

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    ...options,
  });
}

export function useClearCart() {
  const options = useCartMutationOptions();
  return useMutation({ mutationFn: cartApi.clear, ...options });
}

export function useApplyCoupon() {
  const options = useCartMutationOptions();

  return useMutation({
    mutationFn: (code: string) => cartApi.applyCoupon(code),
    ...options,
  });
}

export function useRemoveCoupon() {
  const options = useCartMutationOptions();
  return useMutation({ mutationFn: cartApi.removeCoupon, ...options });
}

/** Offers list, flagged against the current subtotal. */
export function useCoupons(itemsTotal: number) {
  return useQuery({
    queryKey: qk.coupons(itemsTotal),
    queryFn: () => couponsApi.list(itemsTotal),
    staleTime: 5 * 60_000,
  });
}

/** Extracts the "items from another kitchen" details out of a 409. */
export function getKitchenConflict(error: unknown): { name: string } | null {
  if (error instanceof ApiError && error.isKitchenConflict) {
    return { name: error.payload?.existingKitchen?.name ?? 'another kitchen' };
  }
  return null;
}
