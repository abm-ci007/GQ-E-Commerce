import { create } from "zustand";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  kind: "order" | "promo" | "system";
  read: boolean;
  at: string;
}

interface NotifState {
  items: AppNotification[];
  push: (n: Omit<AppNotification, "id" | "at" | "read">) => void;
  markAllRead: () => void;
}

export const useNotifications = create<NotifState>((set) => ({
  items: [
    {
      id: "n1",
      title: "Welcome to ABM",
      body: "Enjoy 10% off your first order with code ABMFIRST.",
      kind: "promo",
      read: false,
      at: new Date().toISOString(),
    },
    {
      id: "n2",
      title: "Editor's picks refreshed",
      body: "New arrivals from Maison ABM & Noir Parfums.",
      kind: "system",
      read: false,
      at: new Date().toISOString(),
    },
  ],
  push: (n) =>
    set((s) => ({
      items: [
        { ...n, id: crypto.randomUUID(), at: new Date().toISOString(), read: false },
        ...s.items,
      ],
    })),
  markAllRead: () =>
    set((s) => ({ items: s.items.map((i) => ({ ...i, read: true })) })),
}));
