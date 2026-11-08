// Mirror of BACKEND_DJANGO.md serializers.
export interface Category {
  id: number;
  slug: string;
  name: string;
  name_ar: string;
  icon?: string;
  parent?: number | null;
  children?: Category[];
}

export interface ProductImage {
  id: number;
  url: string;
  alt?: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price: number;
  discount_price?: number | null;
  stock: number;
  sku: string;

  image?: string | null;

  categories: Category[];
  

  brand?: string;
  tags?: string[];

  images?: ProductImage[];

  rating_avg?: number;
  rating_count?: number;

  seller?: {
    id: number;
    name: string;
  };

  is_featured?: boolean;
  is_approved?: boolean;

  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  product: number;
  user: { id: number; name: string; avatar?: string };
  rating: number;
  title: string;
  body: string;
  replies: { id: number; user: string; body: string; created_at: string }[];
  created_at: string;
}

export type Role = "customer" | "seller" | "admin";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  mobile_phone?: string;
  profile_picture?: string;
  address?: string;
  city?: string;
  country?: string;
  birthdate?: string;
  role: Role;
  is_active: boolean;
  date_joined: string;
}

export type SellerApplicationStatus = "pending" | "approved" | "rejected";
export interface SellerApplication {
  id: number;
  store_name: string;
  business_type: "individual" | "registered" | "brand";
  contact_phone: string;
  city: string;
  website: string;
  description: string;
  status: SellerApplicationStatus;
  review_note: string;
  submitted_at: string;
  reviewed_at: string | null;
  applicant_email?: string;
  applicant_name?: string;
}

export interface SellerDashboard {
  period_days: number;
  revenue: number;
  revenue_basis: string;
  orders: number;
  units_sold: number;
  previous_revenue: number;
  average_order_value: number;
  product_count: number;
  live_products: number;
  pending_products: number;
  low_stock_count: number;
  pending_fulfillment: number;
  daily_sales: { date: string; revenue: number }[];
  top_products: { id: number; name: string; slug: string; units: number; revenue: number }[];
  insights: { kind: string; title: string; detail: string; priority: "high" | "medium" | "low" | "positive" }[];
  insights_method: string;
  analyst: { title: string; summary: string; signals: string[]; limitations: string[] };
  product_actions: {
    increase_stock: SellerProductAction[];
    improve: SellerProductAction[];
    pause_candidates: SellerProductAction[];
  };
  action_plan: { window: string; title: string; actions: string[] }[];
}

export interface SellerProductAction {
  id: number;
  name: string;
  slug: string;
  stock: number;
  units_sold: number;
  suggested_stock?: number;
  reason: string;
}

export interface CartItem {
  id: number;
  product: Product;
  qty: number;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: number;
  user: number;
  items: { product: Product; qty: number; price: number }[];
  shipping_address: {
    full_name: string;
    line1: string;
    city: string;
    country: string;
    phone: string;
  };
  payment_method: "cod";
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  status_history: { status: OrderStatus; changed_at: string }[];
  created_at: string;
}
