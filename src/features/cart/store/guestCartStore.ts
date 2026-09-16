import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvZustandStorage } from '@utils/mmkvStorage';
import { ApiError, cartApi } from '@api';
import type { Cart, CartLine, FoodType } from '@api/types';

/** Just enough of a meal to render a cart line and merge it into the real cart on login. */
export interface GuestCartMealInput {
  id: string;
  name: string;
  image?: string | null;
  price?: number;
  mrp?: number | null;
  foodType?: FoodType;
  calories?: number | null;
  proteinG?: number | null;
  isAvailable?: boolean;
  kitchen?: {
    id: string;
    name: string;
    slug?: string;
    logoUrl?: string | null;
    isVerified?: boolean;
    prepTimeMins?: number;
    isOpenNow?: boolean;
  } | null;
}

interface GuestCartLine {
  mealId: string;
  quantity: number;
  meal: GuestCartMealInput;
}

interface GuestCartState {
  lines: Record<string, GuestCartLine>;
  addItem: (meal: GuestCartMealInput, quantity?: number) => void;
  setQuantity: (mealId: string, quantity: number) => void;
  removeItem: (mealId: string) => void;
  clear: () => void;
}

export const useGuestCartStore = create<GuestCartState>()(
  persist(
    (set) => ({
      lines: {},
      addItem: (meal, quantity = 1) =>
        set((state) => {
          const existing = state.lines[meal.id];
          const nextQuantity = (existing?.quantity ?? 0) + quantity;
          return {
            lines: {
              ...state.lines,
              [meal.id]: { mealId: meal.id, quantity: nextQuantity, meal: existing ? { ...existing.meal, ...meal } : meal },
            },
          };
        }),
      setQuantity: (mealId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const rest = { ...state.lines };
            delete rest[mealId];
            return { lines: rest };
          }
          const existing = state.lines[mealId];
          if (!existing) return state;
          return { lines: { ...state.lines, [mealId]: { ...existing, quantity } } };
        }),
      removeItem: (mealId) =>
        set((state) => {
          const rest = { ...state.lines };
          delete rest[mealId];
          return { lines: rest };
        }),
      clear: () => set({ lines: {} }),
    }),
    {
      name: 'guest-cart-store',
      storage: createJSONStorage(() => mmkvZustandStorage),
    },
  ),
);

const GUEST_LINE_PREFIX = 'guest-';
export const toGuestLineId = (mealId: string) => `${GUEST_LINE_PREFIX}${mealId}`;
export const fromGuestLineId = (lineId: string) => lineId.slice(GUEST_LINE_PREFIX.length);
export const isGuestLineId = (lineId: string) => lineId.startsWith(GUEST_LINE_PREFIX);

/** Builds the same `Cart` shape the server returns, so every screen renders a guest cart exactly like a real one. */
export function buildGuestCart(lines: Record<string, GuestCartLine>): Cart {
  const lineList = Object.values(lines);

  const items: CartLine[] = lineList.map(({ mealId, quantity, meal }) => {
    const unitPrice = meal.price ?? 0;
    return {
      id: toGuestLineId(mealId),
      quantity,
      specialInstructions: null,
      unitPrice,
      lineTotal: unitPrice * quantity,
      customizations: [],
      meal: {
        id: meal.id,
        name: meal.name,
        image: meal.image ?? null,
        basePrice: unitPrice,
        mrp: meal.mrp ?? null,
        foodType: meal.foodType ?? 'VEG',
        calories: meal.calories ?? null,
        proteinG: meal.proteinG ?? null,
        isAvailable: meal.isAvailable ?? true,
      },
    };
  });

  const itemsTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const firstKitchen = lineList[0]?.meal.kitchen ?? null;

  return {
    id: 'guest-cart',
    isEmpty: items.length === 0,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    kitchen: firstKitchen
      ? {
          id: firstKitchen.id,
          name: firstKitchen.name,
          slug: firstKitchen.slug ?? '',
          logoUrl: firstKitchen.logoUrl ?? null,
          isVerified: firstKitchen.isVerified ?? false,
          prepTimeMins: firstKitchen.prepTimeMins ?? 30,
          isOpenNow: firstKitchen.isOpenNow ?? true,
        }
      : null,
    items,
    coupon: { code: null, title: null, discount: 0, invalidReason: null },
    // Coins are account-bound — a guest has no balance to redeem, and applying
    // them only becomes possible once the real, server-side cart takes over.
    coins: { balance: 0, applied: 0, discount: 0, maxRedeemable: 0, minOrderValue: 0, maxPerOrder: 0, invalidReason: null },
    pricing: {
      itemsTotal,
      deliveryFee: 0,
      taxes: 0,
      couponDiscount: 0,
      coinDiscount: 0,
      discount: 0,
      totalAmount: itemsTotal,
      freeDeliveryApplied: true,
      amountToFreeDelivery: 0,
      minOrderValue: 0,
      freeDeliveryAbove: 0,
    },
    // Guests can always tap "Checkout" — the login gate is what stops them, not this flag.
    checkout: { canCheckout: true, blockers: [] },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Replays everything added as a guest into the real, server-side cart right
 * after login — so "what was in the cart stays in the cart" holds even
 * though the guest cart was only ever local to this device.
 *
 * Runs before `isAuthenticated` flips to true (see `authStore.signIn`), so
 * the very first authenticated cart fetch already reflects the merge — no
 * flash of an empty cart in between.
 */
export async function mergeGuestCartIntoAccount(): Promise<void> {
  const { lines, clear } = useGuestCartStore.getState();
  const guestLines = Object.values(lines);
  if (!guestLines.length) return;

  let replaceCart = false;

  for (const line of guestLines) {
    try {
      await cartApi.addItem({ mealId: line.mealId, quantity: line.quantity, replaceCart });
    } catch (error) {
      if (error instanceof ApiError && error.isKitchenConflict && !replaceCart) {
        replaceCart = true;
        try {
          await cartApi.addItem({ mealId: line.mealId, quantity: line.quantity, replaceCart: true });
        } catch {
          // Meal couldn't be merged even after clearing the account cart — skip it.
        }
      }
      // Otherwise (sold out, no longer orderable, etc.) skip this line silently.
    }
  }

  clear();
}
