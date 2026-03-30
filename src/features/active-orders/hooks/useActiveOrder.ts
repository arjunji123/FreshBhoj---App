import { ActiveOrder } from '../active-orders.types';

// Mock data — replace with API call / store logic later
const MOCK_ORDERS: ActiveOrder[] = [
  {
    id: '1',
    title: 'Lunch Tiffin Active',
    status: 'delivering_today',
    statusLabel: 'DELIVERING TODAY',
    nextDeliveryTime: '1:30 PM',
    kitchenName: 'Shri Krishna Veg Kitchen',
  },
];

/**
 * Returns the currently active order to display, or null if none.
 * Logic can be extended to filter by time of day, user prefs, backend data, etc.
 */
export const useActiveOrder = (): ActiveOrder | null => {
  // TODO: Replace with real data source (API / Zustand store)
  return MOCK_ORDERS[0] ?? null;
};
