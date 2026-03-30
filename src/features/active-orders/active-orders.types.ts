export type OrderStatus = 'delivering_today' | 'preparing' | 'scheduled' | 'paused';

export interface ActiveOrder {
  id: string;
  title: string;
  status: OrderStatus;
  statusLabel: string;
  nextDeliveryTime: string;
  kitchenName: string;
}
