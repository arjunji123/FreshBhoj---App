import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderChatApi, qk } from '@api';

/** How often an open chat checks for a new kitchen message. */
const CHAT_POLL_MS = 8_000;

export function useOrderMessages(orderId: string) {
  return useQuery({
    queryKey: qk.orderChat.messages(orderId),
    queryFn: () => orderChatApi.list(orderId),
    enabled: Boolean(orderId),
    refetchInterval: CHAT_POLL_MS,
    staleTime: 0,
  });
}

export function useSendOrderMessage(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => orderChatApi.send(orderId, body),
    onSuccess: (message) => {
      queryClient.setQueryData(qk.orderChat.messages(orderId), (old: unknown) =>
        Array.isArray(old) ? [...old, message] : [message],
      );
      queryClient.invalidateQueries({ queryKey: qk.orders.tracking(orderId) });
    },
  });
}
