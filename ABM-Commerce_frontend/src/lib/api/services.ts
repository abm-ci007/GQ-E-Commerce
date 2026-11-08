import { apiRequest, tokens } from "./client";
import type { Category, Order, Product, SellerApplication, SellerDashboard, User } from "./types";

export const productsApi = {
  list: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();

    return apiRequest<{ count: number; results: Product[] }>(`/products/${q ? `?${q}` : ""}`, {
      auth: false,
    });
  },
  detail: (slug: string) =>
    apiRequest<Product & { related: Product[]; reviews: any[] }>(`/products/${slug}/`, {
      auth: false,
    }),
  create: (body: Partial<Product>) => apiRequest<Product>("/products/", { method: "POST", body }),
  update: (slug: string, body: Partial<Product>) =>
    apiRequest<Product>(`/products/${slug}/`, { method: "PATCH", body }),
  remove: (slug: string) =>
    apiRequest<{ detail: string }>(`/products/${slug}/`, { method: "DELETE" }),
};

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const response = await apiRequest<Category[] | { results?: Category[] }>(
      "/products/categories/",
      { auth: false },
    );
    return Array.isArray(response)
      ? response
      : Array.isArray(response.results)
        ? response.results
        : [];
  },
};

export const authApi = {
  register: (body: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    mobile_phone?: string;
  }) =>
    apiRequest<{ detail: string; pending: boolean; development_code?: string }>("/auth/register/", {
      method: "POST",
      body,
      auth: false,
    }),
  resendVerification: (email: string) =>
    apiRequest<{ detail: string; development_code?: string }>("/auth/register/resend-code/", {
      method: "POST",
      body: { email },
      auth: false,
    }),
  login: (body: { email: string; password: string }) =>
    apiRequest<{ access: string; refresh: string; user: User }>("/auth/login/", {
      method: "POST",
      body,
      auth: false,
    }),
  verifyEmail: (email: string, code: string) =>
    apiRequest<{ access: string; refresh: string; user: User }>("/auth/verify-email/", {
      method: "POST",
      body: { email, code },
      auth: false,
    }),
  google: (credential: string) =>
    apiRequest<{ access: string; refresh: string; user: User }>("/auth/google/", {
      method: "POST",
      body: { credential },
      auth: false,
    }),
  me: () => apiRequest<User>("/auth/me/"),
  updateMe: (body: Partial<User>) => apiRequest<User>("/auth/me/", { method: "PATCH", body }),
  resetPassword: (email: string) =>
    apiRequest<{ detail: string; development_code?: string }>("/auth/password-reset/", {
      method: "POST",
      body: { email },
      auth: false,
    }),
  confirmPasswordReset: (body: { email: string; code: string; password: string }) =>
    apiRequest<{ detail: string }>("/auth/password-reset/", {
      method: "PUT",
      body,
      auth: false,
    }),
  logout: () => tokens.clear(),
};

export const ordersApi = {
  list: () =>
    apiRequest<{ count: number; results: Order[] }>("/orders/").then((page) => page.results),
  create: (body: any) => apiRequest<Order>("/orders/", { method: "POST", body }),
  detail: (id: number) => apiRequest<Order>(`/orders/${id}/`),
};

export const sellerApi = {
  application: () => apiRequest<{ application: SellerApplication | null }>("/auth/seller-application/"),
  apply: (body: Omit<SellerApplication, "id" | "status" | "review_note" | "submitted_at" | "reviewed_at">) =>
    apiRequest<{ application: SellerApplication }>("/auth/seller-application/", { method: "POST", body }),
  dashboard: () => apiRequest<SellerDashboard>("/products/seller/dashboard/"),
  applications: (status = "pending") =>
    apiRequest<SellerApplication[]>(`/auth/admin/seller-applications/?status=${status}`),
  review: (id: number, status: "approved" | "rejected", review_note = "") =>
    apiRequest<SellerApplication>(`/auth/admin/seller-applications/${id}/review/`, {
      method: "PATCH",
      body: { status, review_note },
    }),
};
