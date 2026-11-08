import { create } from "zustand";
import type { User } from "@/lib/api/types";
import { authApi } from "@/lib/api/services";
import { tokens } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "pending_activation";
  error?: string;
  acceptSession: (session: { access: string; refresh: string; user: User }) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (body: {
    first_name: string; last_name: string;
    email: string; password: string; mobile_phone?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  updateProfile: (body: Partial<User>) => Promise<void>;
}

let sessionRefreshPromise: Promise<void> | null = null;

export const useAuth = create<AuthState>()(
    (set, get) => ({
      user: null,
      status: "idle",
      acceptSession(session) {
        tokens.set(session);
        set({ user: session.user, status: "authenticated", error: undefined });
      },
      async login(email, password) {
        set({ status: "loading", error: undefined });
        try {
          const { access, refresh, user } = await authApi.login({ email, password });
          get().acceptSession({ access, refresh, user });
        } catch (e: any) {
          set({ status: "idle", error: e.message });
          throw e;
        }
      },
      async register(body) {
        set({ status: "loading", error: undefined });
        try {
          await authApi.register(body);
          set({ status: "pending_activation" });
        } catch (e: any) {
          set({ status: "idle", error: e.message });
          throw e;
        }
      },
      logout() {
        tokens.clear();
        set({ user: null, status: "idle" });
      },
      async refreshMe() {
        if (sessionRefreshPromise) return sessionRefreshPromise;
        sessionRefreshPromise = (async () => {
          if (!tokens.access) {
            set({ user: null, status: "idle" });
            return;
          }
          set({ status: "loading" });
          try {
            const me = await authApi.me();
            set({ user: me, status: "authenticated" });
          } catch {
            tokens.clear();
            set({ user: null, status: "idle" });
          }
        })();
        try {
          await sessionRefreshPromise;
        } finally {
          sessionRefreshPromise = null;
        }
      },
      async updateProfile(body) {
        const me = await authApi.updateMe(body);
        set({ user: me });
      },
    }),
);

if (typeof window !== "undefined") {
  window.addEventListener("auth:signout", () => useAuth.getState().logout());
}
