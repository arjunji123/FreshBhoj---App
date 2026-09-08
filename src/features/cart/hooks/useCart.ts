import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, cartApi, couponsApi, qk } from '@api';
import type { AddCartItemInput } from '@api/endpoints/cart.api';
import type { Cart, CartLine } from '@api/types';
import { useAuthStore } from '@features/authentication/store/authStore';
import {
  buildGuestCart,
  fromGuestLineId,
  isGuestLineId,
  useGuestCartStore,
  type GuestCartMealInput,
} from '../store/guestCartStore';

/**
 * Full cart with server-computed pricing and checkout blockers.
 *
 * A guest never fetches this — `enabled` stays false — but the cache still
 * holds whatever `buildGuestCart()` last wrote via a cart mutation, so this
 * reads back exactly like a real cart until the guest logs in.
 */
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

/**
 * Adding a meal from any screen — as a guest this only ever touches the
 * local guest cart (there is no anonymous cart on the server); it still
 * resolves to a `Cart`, so `useCartMutationOptions`'s `onSuccess` writes it
 * into the same cache a real add-to-cart would.
 */
export function useAddToCart() {
  const options = useCartMutationOptions();
  const isGuest = useAuthStore((s) => s.isGuest);

  return useMutation({
    mutationFn: (input: AddCartItemInput & { mealSnapshot?: GuestCartMealInput }) => {
      if (isGuest) {
        useGuestCartStore.getState().addItem(input.mealSnapshot ?? { id: input.mealId, name: '' }, input.quantity ?? 1);
        return Promise.resolve(buildGuestCart(useGuestCartStore.getState().lines));
      }
      return cartApi.addItem(input);
    },
    ...options,
  });
}

export function useUpdateCartItem() {
  const options = useCartMutationOptions();
  const isGuest = useAuthStore((s) => s.isGuest);

  return useMutation({
    mutationFn: ({
      itemId,
      quantity,
      specialInstructions,
    }: {
      itemId: string;
      quantity: number;
      specialInstructions?: string;
    }) => {
      if (isGuest && isGuestLineId(itemId)) {
        useGuestCartStore.getState().setQuantity(fromGuestLineId(itemId), quantity);
        return Promise.resolve(buildGuestCart(useGuestCartStore.getState().lines));
      }
      return cartApi.updateItem(itemId, { quantity, specialInstructions });
    },
    ...options,
  });
}

export function useRemoveCartItem() {
  const options = useCartMutationOptions();
  const isGuest = useAuthStore((s) => s.isGuest);

  return useMutation({
    mutationFn: (itemId: string) => {
      if (isGuest && isGuestLineId(itemId)) {
        useGuestCartStore.getState().removeItem(fromGuestLineId(itemId));
        return Promise.resolve(buildGuestCart(useGuestCartStore.getState().lines));
      }
      return cartApi.removeItem(itemId);
    },
    ...options,
  });
}

export function useClearCart() {
  const options = useCartMutationOptions();
  const isGuest = useAuthStore((s) => s.isGuest);

  return useMutation({
    mutationFn: () => {
      if (isGuest) {
        useGuestCartStore.getState().clear();
        return Promise.resolve(buildGuestCart({}));
      }
      return cartApi.clear();
    },
    ...options,
  });
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

/** Maps `mealId -> cart line`, so any card can show the right quantity. */
export function useCartLineIndex(): Map<string, CartLine> {
  const { data: cart } = useCart();

  return useMemo(() => {
    const map = new Map<string, CartLine>();
    cart?.items.forEach((line) => map.set(line.meal.id, line));
    return map;
  }, [cart]);
}

/**
 * Quantity read/write for the shared `AddToCartControl` — first unit goes
 * through the caller's kitchen-conflict-aware `addToCart`, every change after
 * that is a plain update or remove against the existing cart line.
 */
export function useCartQuantityControls() {
  const cartLines = useCartLineIndex();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const getQuantity = useCallback(
    (mealId: string) => cartLines.get(mealId)?.quantity ?? 0,
    [cartLines],
  );

  const changeQuantity = useCallback(
    (mealId: string, next: number) => {
      const line = cartLines.get(mealId);
      if (!line) return;
      if (next <= 0) {
        removeItem.mutate(line.id);
        return;
      }
      updateItem.mutate({ itemId: line.id, quantity: next });
    },
    [cartLines, updateItem, removeItem],
  );

  return { getQuantity, changeQuantity, isBusy: updateItem.isPending || removeItem.isPending };
}

/** Extracts the "items from another kitchen" details out of a 409. */
export function getKitchenConflict(error: unknown): { name: string } | null {
  if (error instanceof ApiError && error.isKitchenConflict) {
    return { name: error.payload?.existingKitchen?.name ?? 'another kitchen' };
  }
  return null;
}
