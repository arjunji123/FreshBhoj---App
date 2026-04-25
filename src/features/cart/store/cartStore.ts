import { create } from 'zustand';
import type { FoodCardItem } from '@components/FoodCard';

type CartState = {
  items: FoodCardItem[];
  kitchenId: string | null;
  addItem: (item: FoodCardItem) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  kitchenId: null,
  addItem: (item) => {
    const existingItems = get().items;

    set({
      items: [...existingItems, item],
      kitchenId: item.kitchenId,
    });
  },
  clearCart: () => {
    set({ items: [], kitchenId: null });
  },
}));

