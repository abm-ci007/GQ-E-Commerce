/**
 * ABM-commerce API client.
 * Fetch-based with a 401 refresh-token interceptor.
 * See BACKEND_DJANGO.md for the full contract.
 */

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8000/api";

export const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK_API as string | undefined) !== "false";

const STORAGE = {
  access: "abm.auth.access",
  refresh: "abm.auth.refresh",
  user: "abm.auth.user",
};

export const tokens = {
  get access() {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(STORAGE.access);
  },
  get refresh() {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(STORAGE.refresh);
  },
  set({ access, refresh }: { access: string; refresh?: string }) {
    sessionStorage.setItem(STORAGE.access, access);
    if (refresh) sessionStorage.setItem(STORAGE.refresh, refresh);
  },
  clear() {
    sessionStorage.removeItem(STORAGE.access);
    sessionStorage.removeItem(STORAGE.refresh);
    sessionStorage.removeItem(STORAGE.user);
  },
};

export class ApiError extends Error {
  status: number;
  code?: string;
  fields?: Record<string, string[]>;
  constructor(status: number, body: any) {
    super(body?.detail ?? `Request failed (${status})`);
    this.status = status;
    this.code = body?.code;
    this.fields = body?.fields;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  const refresh = tokens.refresh;
  if (!refresh) return null;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) throw new Error("refresh failed");
      const data = await res.json();
      tokens.set({ access: data.access });
      return data.access as string;
    } catch {
      tokens.clear();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:signout"));
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: any;
  auth?: boolean;
  _retry?: boolean;
}

export async function apiRequest<T = any>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  if (USE_MOCK) {
    const { mockRouter } = await import("./mock");
    return mockRouter<T>(path, opts);
  }
  const headers = new Headers(opts.headers);
  headers.set("Accept", "application/json");
  if (opts.body && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (opts.auth !== false) {
    const access = tokens.access;
    if (access) headers.set("Authorization", `Bearer ${access}`);
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers,
    body:
      opts.body instanceof FormData
        ? opts.body
        : opts.body
          ? JSON.stringify(opts.body)
          : undefined,
  });

  if (res.status === 401 && !opts._retry && opts.auth !== false) {
    const newAccess = await refreshAccess();
    if (newAccess) return apiRequest<T>(path, { ...opts, _retry: true });
  }

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("json") ? await res.json() : await res.text();
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}
