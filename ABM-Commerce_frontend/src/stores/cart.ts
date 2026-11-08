import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/api/types";

export interface CartLine {
  product: Product;
  qty: number;
}

interface CartState {
  items: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (p: Product, qty?: number) => void;
  update: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      add: (product, qty = 1) =>
        set((s) => {
          const found = s.items.find((i) => i.product.id === product.id);
          if (found) {
            return {
              items: s.items.map((i) =>
                i.product.id === product.id ? { ...i, qty: i.qty + qty } : i,
              ),
              isOpen: true,
            };
          }
          return { items: [...s.items, { product, qty }], isOpen: true };
        }),
      update: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.product.id !== id)
              : s.items.map((i) => (i.product.id === id ? { ...i, qty } : i)),
        })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.product.id !== id) })),
      clear: () => set({ items: [] }),
      subtotal: () =>
        get().items.reduce(
          (s, i) => s + (i.product.discount_price ?? i.product.price) * i.qty,
          0,
        ),
      count: () => get().items.reduce((s, i) => s + i.qty, 0),
    }),
    { name: "abm.cart", partialize: (s) => ({ items: s.items }) },
  ),
);
