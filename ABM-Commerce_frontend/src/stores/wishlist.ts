import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/api/types";

interface WishlistState {
  items: Product[];
  has: (id: number) => boolean;
  toggle: (product: Product) => void;
  remove: (id: number) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      has: (id) => get().items.some((item) => item.id === id),
      toggle: (product) =>
        set((state) => ({
          items: state.items.some((item) => item.id === product.id)
            ? state.items.filter((item) => item.id !== product.id)
            : [...state.items, product],
        })),
      remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
    }),
    { name: "abm.saved-items", partialize: (state) => ({ items: state.items }) },
  ),
);
