import { useMemo } from 'react';
import { useActiveOrders } from '@features/orders/hooks/useOrders';
import { formatTime } from '@utils/format';
import type { OrderStatus as ApiOrderStatus } from '@api/types';
import type { ActiveOrder, OrderStatus } from '../active-orders.types';

const STATUS_MAP: Partial<Record<ApiOrderStatus, { status: OrderStatus; label: string }>> = {
  PLACED: { status: 'scheduled', label: 'Placed' },
  ACCEPTED: { status: 'scheduled', label: 'Accepted' },
  PREPARING: { status: 'preparing', label: 'Preparing' },
  OUT_FOR_DELIVERY: { status: 'delivering_today', label: 'On the way' },
};

/**
 * The customer's most recent in-flight order, straight from `GET
 * /customer/orders/active` — or null when nothing is on its way.
 */
export const useActiveOrder = (): ActiveOrder | null => {
  const { data } = useActiveOrders();
  const order = data?.[0];

  return useMemo(() => {
    if (!order) return null;
    const mapped = STATUS_MAP[order.status] ?? { status: 'scheduled' as const, label: order.statusLabel };
    return {
      id: order.id,
      title: order.itemSummary,
      status: mapped.status,
      statusLabel: mapped.label,
      nextDeliveryTime: formatTime(order.eta.expectedAt),
      kitchenName: order.kitchen.name,
    };
  }, [order]);
};
