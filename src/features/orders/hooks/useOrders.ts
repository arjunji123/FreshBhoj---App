import { useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi, qk } from '@api';
import type { PlaceOrderInput } from '@api/endpoints/orders.api';
import type { OrderCard, OrderStatus, Paginated } from '@api/types';
import { useAuthStore } from '@features/authentication/store/authStore';

/** How often the tracking screen re-polls while an order is in flight. */
const TRACKING_POLL_MS = 15_000;

export function useOrderHistory(status?: OrderStatus[]) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useInfiniteQuery({
    queryKey: qk.orders.history(status),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => ordersApi.history({ page: pageParam as number, limit: 10, status }),
    getNextPageParam: (lastPage: Paginated<OrderCard>) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled: Boolean(isAuthenticated),
  });
}

/** Orders in flight — drives the Home strip and the "track" entry points. */
export function useActiveOrders() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: qk.orders.active,
    queryFn: ordersApi.active,
    enabled: Boolean(isAuthenticated),
    refetchInterval: (query) => (query.state.data?.length ? TRACKING_POLL_MS * 2 : false),
    staleTime: 10_000,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: qk.orders.detail(orderId),
    queryFn: () => ordersApi.detail(orderId),
    enabled: Boolean(orderId),
  });
}

/**
 * Live tracking. Polls only while the order is actually moving — once it is
 * delivered or cancelled the interval stops, so a backgrounded screen on a
 * finished order costs nothing.
 */
export function useOrderTracking(orderId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: qk.orders.tracking(orderId),
    queryFn: () => ordersApi.tracking(orderId),
    enabled: Boolean(orderId),
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (!status || status === 'DELIVERED' || status === 'CANCELLED') return false;
      return TRACKING_POLL_MS;
    },
  });

  // A terminal status invalidates the history list so the card there updates too.
  const status = query.data?.status;
  useEffect(() => {
    if (status === 'DELIVERED' || status === 'CANCELLED') {
      queryClient.invalidateQueries({ queryKey: qk.orders.all });
    }
  }, [status, queryClient]);

  return query;
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PlaceOrderInput) => ordersApi.place(input),
    onSuccess: (order) => {
      queryClient.setQueryData(qk.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: qk.orders.all });
      queryClient.invalidateQueries({ queryKey: qk.cart.all });
    },
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, paymentRef }: { orderId: string; paymentRef?: string }) =>
      ordersApi.confirmPayment(orderId, paymentRef),
    onSuccess: (order) => {
      queryClient.setQueryData(qk.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: qk.orders.all });
      // The cart is emptied server-side once payment lands.
      queryClient.invalidateQueries({ queryKey: qk.cart.all });
    },
  });
}

export function useFailPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.failPayment(orderId),
    onSuccess: (order) => queryClient.setQueryData(qk.orders.detail(order.id), order),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      ordersApi.cancel(orderId, reason),
    onSuccess: (order) => {
      queryClient.setQueryData(qk.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: qk.orders.all });
    },
  });
}

export function useReorder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.reorder(orderId),
    onSuccess: (result) => {
      queryClient.setQueryData(qk.cart.detail, result.cart);
      queryClient.invalidateQueries({ queryKey: qk.cart.all });
    },
  });
}
