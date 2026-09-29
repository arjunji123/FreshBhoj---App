import { create } from 'zustand';
import type { BillingCycle, DayOfWeek, FoodType, MealSlot, PaymentMethod } from '@api/types';

/**
 * Cross-step state for the bespoke Setup Plan wizard (kitchen → plan details
 * → delivery → review). Each step is its own `Stack.Screen`, not one screen
 * with internal step state, so this is what carries the accumulated answer
 * from one screen to the next instead of a ballooning route-param chain.
 *
 * Deliberately not `persist`-wrapped (unlike `guestCartStore`) — losing
 * wizard progress on app kill is fine, this is a short in-session flow, and
 * NOT persisting is what keeps a half-finished attempt from silently
 * reappearing days later.
 */
interface SetupPlanState {
  kitchenId: string | null;
  kitchenName: string | null;

  // Step 1 — Plan
  foodType: FoodType | null;
  mealsPerDay: number;
  deliveryDays: DayOfWeek[];
  deliveryTime: MealSlot | null;
  billingCycle: BillingCycle | null;

  // Step 2 — Delivery & Schedule
  addressId: string | null;
  startDate: string | null;
  specialInstructions: string;

  // Step 3 — Review & Pay
  paymentMethod: PaymentMethod;
  requestedCoins: number;

  setKitchen: (kitchenId: string, kitchenName: string) => void;
  setPlanDetails: (input: Partial<{
    foodType: FoodType;
    mealsPerDay: number;
    deliveryDays: DayOfWeek[];
    deliveryTime: MealSlot;
    billingCycle: BillingCycle;
  }>) => void;
  setDelivery: (input: Partial<{
    addressId: string | null;
    startDate: string | null;
    specialInstructions: string;
  }>) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setRequestedCoins: (coins: number) => void;
  reset: () => void;
}

const initialState = {
  kitchenId: null,
  kitchenName: null,
  foodType: null,
  mealsPerDay: 1,
  deliveryDays: [],
  deliveryTime: null,
  billingCycle: null,
  addressId: null,
  startDate: null,
  specialInstructions: '',
  paymentMethod: 'UPI',
  requestedCoins: 0,
} satisfies Omit<
  SetupPlanState,
  'setKitchen' | 'setPlanDetails' | 'setDelivery' | 'setPaymentMethod' | 'setRequestedCoins' | 'reset'
>;

export const useSetupPlanStore = create<SetupPlanState>()((set) => ({
  ...initialState,

  setKitchen: (kitchenId, kitchenName) => set({ kitchenId, kitchenName }),

  setPlanDetails: (input) => set((state) => ({ ...state, ...input })),

  setDelivery: (input) => set((state) => ({ ...state, ...input })),

  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  setRequestedCoins: (requestedCoins) => set({ requestedCoins }),

  reset: () => set({ ...initialState }),
}));
