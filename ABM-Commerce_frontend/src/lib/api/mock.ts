import type { Category, Order, Product, Review, SellerApplication, User } from "./types";
import type { RequestOptions } from "./client";
import { ApiError } from "./client";

/* --------------------------------- seed --------------------------------- */

const IMG = (seed: string, w = 900, h = 1100) =>
  `https://images.unsplash.com/photo-${seed}?w=${w}&h=${h}&fit=crop&auto=format`;

export const CATEGORIES: Category[] = [
  { id: 1, slug: "fashion", name: "Fashion", name_ar: "أزياء", icon: "shirt" },
  { id: 2, slug: "home-living", name: "Home & Living", name_ar: "المنزل", icon: "sofa" },
  { id: 3, slug: "beauty", name: "Beauty", name_ar: "الجمال", icon: "sparkles" },
  { id: 4, slug: "technology", name: "Technology", name_ar: "تكنولوجيا", icon: "cpu" },
  { id: 5, slug: "wellness", name: "Wellness", name_ar: "العافية", icon: "leaf" },
  { id: 6, slug: "gourmet", name: "Gourmet", name_ar: "المذاق", icon: "coffee" },
];

const seedProducts: Omit<Product, "id" | "created_at" | "updated_at">[] = [
  {
    slug: "silk-scarf",
    name: "Silk Scarf",
    name_ar: "وشاح حرير أتيليه",
    description:
      "Hand-rolled Italian silk twill, printed with an original archive motif. A weightless finishing gesture.",
    description_ar: "حرير إيطالي فاخر مطبوع بنقوش أرشيفية أصلية.",
    price: 340,
    discount_price: 289,
    stock: 24,
    sku: "SC-001",
    categories: [CATEGORIES[0]],
    brand: "Maison ABM",
    tags: ["silk", "italian", "printed"],
    images: [{ id: 1, url: IMG("1601924582970-9238bcb495d9"), alt: "silk scarf" }],
    rating_avg: 4.8,
    rating_count: 128,
    seller: { id: 1, name: "Maison ABM" },
    is_featured: true,
    is_approved: true,
  },
  {
    slug: "monolith-ceramic-vase",
    name: "Monolith Ceramic Vase",
    name_ar: "مزهرية سيراميك",
    description: "Wheel-thrown stoneware with a mineral ash glaze. Each piece unique.",
    description_ar: "حجر السيراميك المصنوع يدويًا بطلاء معدني.",
    price: 210,
    stock: 12,
    sku: "HM-014",
    categories: [CATEGORIES[1]],
    brand: "Terre",
    tags: ["ceramic", "handmade"],
    images: [{ id: 2, url: IMG("1578500494198-246f612d3b3d"), alt: "vase" }],
    rating_avg: 4.9,
    rating_count: 42,
    seller: { id: 2, name: "Terre Studio" },
    is_featured: true,
    is_approved: true,
  },
  {
    slug: "obsidian-fragrance-no-7",
    name: "Obsidian Fragrance N°7",
    name_ar: "عطر أوبسيديان رقم ٧",
    description: "Smoked oud, black fig, incense. A nocturne in three acts.",
    description_ar: "عود مدخن، تين أسود، بخور.",
    price: 195,
    stock: 60,
    sku: "BT-007",
    categories: [CATEGORIES[2]],
    brand: "Noir Parfums",
    tags: ["oud", "unisex"],
    images: [{ id: 3, url: IMG("1541643600914-78b084683601"), alt: "perfume" }],
    rating_avg: 4.7,
    rating_count: 311,
    seller: { id: 3, name: "Noir Parfums" },
    is_featured: true,
    is_approved: true,
  },
  {
    slug: "aura-wireless-headphones",
    name: "Aura Over-Ear Headphones",
    name_ar: "سماعات أورا",
    description: "Aluminium chassis, lambskin ear cushions, 60-hour battery.",
    description_ar: "هيكل من الألمنيوم مع بطارية 60 ساعة.",
    price: 620,
    discount_price: 549,
    stock: 32,
    sku: "TC-201",
    categories: [CATEGORIES[3]],
    brand: "Aura Audio",
    tags: ["wireless", "premium"],
    images: [{ id: 4, url: IMG("1583394838336-acd977736f90"), alt: "headphones" }],
    rating_avg: 4.6,
    rating_count: 88,
    seller: { id: 4, name: "Aura" },
    is_featured: true,
    is_approved: true,
  },
  {
    slug: "linen-shirt",
    name: "Linen Shirt",
    name_ar: "قميص كتان",
    description: "Belgian linen, tonal horn buttons, boxed cut.",
    description_ar: "كتان بلجيكي بأزرار من القرن.",
    price: 260,
    stock: 44,
    sku: "FS-018",
    categories: [CATEGORIES[0]],
    brand: "Maison ABM",
    tags: ["linen", "unisex"],
    images: [{ id: 5, url: IMG("1516762689617-e1cffcef479d"), alt: "linen shirt" }],
    rating_avg: 4.5,
    rating_count: 67,
    seller: { id: 1, name: "Maison ABM" },
    is_featured: false,
    is_approved: true,
  },
  {
    slug: "ember-cast-iron-kettle",
    name: "Ember Cast-Iron Kettle",
    name_ar: "غلاية حديد",
    description: "Nambu tetsubin technique. Slow, mineral pour.",
    description_ar: "تقنية نامبو التقليدية.",
    price: 380,
    stock: 18,
    sku: "HM-032",
    categories: [CATEGORIES[5]],
    brand: "Ember",
    tags: ["tea", "iron"],
    images: [{ id: 6, url: IMG("1519677100203-a0e668c92439"), alt: "kettle" }],
    rating_avg: 4.9,
    rating_count: 51,
    seller: { id: 5, name: "Ember" },
    is_featured: false,
    is_approved: true,
  },
  {
    slug: "veil-cashmere-throw",
    name: "Veil Cashmere Throw",
    name_ar: "بطانية كشمير",
    description: "Mongolian cashmere, hand-finished fringe.",
    description_ar: "كشمير منغولي بحواف يدوية.",
    price: 450,
    stock: 20,
    sku: "HM-050",
    categories: [CATEGORIES[1]],
    brand: "Veil",
    tags: ["cashmere", "throw"],
    images: [{ id: 7, url: IMG("1522708323590-d24dbb6b0267"), alt: "throw" }],
    rating_avg: 4.8,
    rating_count: 34,
    seller: { id: 6, name: "Veil" },
    is_featured: true,
    is_approved: true,
  },
  {
    slug: "prism-supplement-daily",
    name: "Prism Daily Supplement",
    name_ar: "مكمل يومي",
    description: "Adaptogen complex. 30-day glass jar.",
    description_ar: "مكمل يومي في وعاء زجاجي.",
    price: 68,
    stock: 120,
    sku: "WL-002",
    categories: [CATEGORIES[4]],
    brand: "Prism",
    tags: ["daily", "adaptogen"],
    images: [{ id: 8, url: IMG("1556228578-8c89e6adf883"), alt: "supplement" }],
    rating_avg: 4.4,
    rating_count: 210,
    seller: { id: 7, name: "Prism" },
    is_featured: false,
    is_approved: true,
  },
];

for (let i = 0; i < 100; i++) {
  const templates = seedProducts.slice(0, 8);
  const base = templates[i % templates.length];
  const samplePrice = Number((120 + ((i * 37) % 12000) / 10).toFixed(2));
  seedProducts.push({
    ...base,
    slug: `sample-${i + 1}-${base.slug}`,
    name: `${base.name} Sample ${String(i + 1).padStart(3, "0")}`,
    name_ar: `${base.name_ar} ${i + 1}`,
    sku: `DEMO-${String(i + 1).padStart(3, "0")}`,
    price: samplePrice,
    discount_price: i % 4 === 0 ? Number((samplePrice * (0.68 + (i % 15) / 100)).toFixed(2)) : null,
    stock: 1 + ((i * 11) % 75),
    rating_count: (i * 13) % 250,
    is_featured: i < 8,
  });
}

const now = new Date().toISOString();
export const PRODUCTS: Product[] = seedProducts.map((p, i) => ({
  ...p,
  id: i + 1,
  created_at: now,
  updated_at: now,
}));

const REVIEWS: Review[] = [
  {
    id: 1,
    product: 1,
    user: { id: 10, name: "Layla H." },
    rating: 5,
    title: "Wearable art",
    body: "The weight and drape are unreal. Worth every dirham.",
    replies: [{ id: 1, user: "Maison ABM", body: "Thank you, Layla.", created_at: now }],
    created_at: now,
  },
  {
    id: 2,
    product: 1,
    user: { id: 11, name: "Omar D." },
    rating: 4,
    title: "Gorgeous — small print",
    body: "Slightly smaller than expected. Still stunning.",
    replies: [],
    created_at: now,
  },
];

const USERS: User[] = [
  {
    id: 1,
    email: "you@abm.co",
    first_name: "Ada",
    last_name: "Reyes",
    mobile_phone: "+971500000000",
    address: "Al Wasl 12",
    city: "Dubai",
    country: "AE",
    birthdate: "1994-04-01",
    role: "customer",
    is_active: true,
    date_joined: now,
  },
  {
    id: 2,
    email: "admin@abm.test",
    first_name: "ABM",
    last_name: "Admin",
    role: "admin",
    is_active: true,
    date_joined: now,
  },
];
let ACTIVE_USER = USERS[0];
if (typeof window !== "undefined") {
  const savedUserId = Number(window.sessionStorage.getItem("abm.mock.user"));
  ACTIVE_USER = USERS.find((user) => user.id === savedUserId) ?? USERS[0];
}

function setActiveUser(user: User) {
  ACTIVE_USER = user;
  if (typeof window !== "undefined") window.sessionStorage.setItem("abm.mock.user", String(user.id));
}

const ORDERS: Order[] = [];
let SELLER_APPLICATION: SellerApplication | null = null;

/* --------------------------------- router -------------------------------- */

const delay = <T>(v: T, ms = 220) => new Promise<T>((r) => setTimeout(() => r(v), ms));

export async function mockRouter<T>(path: string, opts: RequestOptions): Promise<T> {
  const method = (opts.method ?? "GET").toUpperCase();
  const body = opts.body ?? {};
  const url = new URL(`http://mock${path}`);
  const p = url.pathname;
  const q = url.searchParams;

  // AUTH
  if (p === "/auth/register/" && method === "POST") {
    return delay({ detail: "Activation email sent. Expires in 24h.", pending: true }) as any;
  }
  if ((p === "/auth/token/" || p === "/auth/login/") && method === "POST") {
    const user = USERS.find((u) => u.email === body.email) ?? USERS[0];
    setActiveUser(user);
    return delay({
      access: "mock.access." + Date.now(),
      refresh: "mock.refresh." + Date.now(),
      user,
    }) as any;
  }
  if (p === "/auth/verify-email/" && method === "POST") {
    const user = ACTIVE_USER;
    return delay({
      access: "mock.access." + Date.now(),
      refresh: "mock.refresh." + Date.now(),
      user,
    }) as any;
  }
  if (p === "/auth/google/" && method === "POST") {
    const user = ACTIVE_USER;
    return delay({
      access: "mock.access." + Date.now(),
      refresh: "mock.refresh." + Date.now(),
      user,
    }) as any;
  }
  if (p === "/auth/token/refresh/" && method === "POST") {
    return delay({ access: "mock.access." + Date.now() }) as any;
  }
  if (p === "/auth/me/" && method === "GET") return delay(ACTIVE_USER) as any;
  if (p === "/auth/me/" && method === "PATCH") {
    Object.assign(ACTIVE_USER, body, { email: ACTIVE_USER.email, role: ACTIVE_USER.role });
    return delay(ACTIVE_USER) as any;
  }
  if (p === "/auth/seller-application/" && method === "GET") {
    const application = ACTIVE_USER.role === "admin" || SELLER_APPLICATION?.applicant_email === ACTIVE_USER.email
      ? SELLER_APPLICATION
      : null;
    return delay({ application }) as any;
  }
  if (p === "/auth/seller-application/" && method === "POST") {
    if (ACTIVE_USER.role === "seller") throw new ApiError(409, { detail: "This account already has seller access." });
    if (SELLER_APPLICATION?.status === "pending") throw new ApiError(409, { detail: "An application is already in review." });
    SELLER_APPLICATION = {
      ...(body as any),
      id: SELLER_APPLICATION?.id ?? 1,
      status: "pending",
      review_note: "",
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      applicant_email: ACTIVE_USER.email,
      applicant_name: `${ACTIVE_USER.first_name} ${ACTIVE_USER.last_name}`,
    };
    return delay({ application: SELLER_APPLICATION }) as any;
  }
  if (p === "/auth/admin/seller-applications/" && method === "GET") {
    if (ACTIVE_USER.role !== "admin") throw new ApiError(403, { detail: "Administrator access is required." });
    const requested = q.get("status");
    const applications = SELLER_APPLICATION && (!requested || SELLER_APPLICATION.status === requested)
      ? [SELLER_APPLICATION]
      : [];
    return delay(applications) as any;
  }
  const reviewMatch = p.match(/^\/auth\/admin\/seller-applications\/(\d+)\/review\/$/);
  if (reviewMatch && method === "PATCH") {
    if (ACTIVE_USER.role !== "admin") throw new ApiError(403, { detail: "Administrator access is required." });
    if (!SELLER_APPLICATION || SELLER_APPLICATION.id !== Number(reviewMatch[1])) throw new ApiError(404, { detail: "Application not found." });
    if (SELLER_APPLICATION.status !== "pending") throw new ApiError(409, { detail: "Only pending applications can be reviewed." });
    SELLER_APPLICATION = {
      ...SELLER_APPLICATION,
      status: body.status,
      review_note: body.review_note ?? "",
      reviewed_at: new Date().toISOString(),
    };
    if (body.status === "approved") {
      const applicant = USERS.find((user) => user.email === SELLER_APPLICATION?.applicant_email);
      if (applicant) applicant.role = "seller";
    }
    return delay(SELLER_APPLICATION) as any;
  }
  if (p === "/auth/password-reset/" && method === "POST") {
    return delay({ detail: "Reset link sent." }) as any;
  }

  // CATEGORIES
  if (p === "/products/categories/" && method === "GET") return delay(CATEGORIES) as any;

  if (p === "/products/seller/dashboard/" && method === "GET") {
    if (ACTIVE_USER.role !== "seller") throw new ApiError(403, { detail: "Approved seller access is required." });
    const mine = PRODUCTS.filter((product) => product.seller?.id === ACTIVE_USER.id);
    return delay({
      period_days: 30, revenue: 0, revenue_basis: "Demo data. Live sales insights appear as orders are recorded.", orders: 0, units_sold: 0, previous_revenue: 0,
      average_order_value: 0, product_count: mine.length,
      live_products: mine.filter((product) => product.is_approved).length,
      pending_products: mine.filter((product) => !product.is_approved).length,
      low_stock_count: mine.filter((product) => product.stock <= 5).length,
      pending_fulfillment: 0, daily_sales: [], top_products: [],
      insights: mine.length ? [] : [{ kind: "listing", title: "Publish your first listing", detail: "Add a clear photo, a complete description, and an accurate price to help shoppers choose.", priority: "positive" }],
      insights_method: "Demo workspace. Live sales insights appear as order data is recorded.",
      analyst: { title: "محلل البيع والمنتجات", summary: `تم تحليل ${mine.length} منتجًا في مساحة العرض التجريبية.`, signals: ["الطلبات", "المخزون", "الأسعار المعروضة"], limitations: ["البيانات تجريبية؛ لا تتوفر الزيارات أو تكلفة الشراء أو المرتجعات."] },
      product_actions: { increase_stock: [], improve: [], pause_candidates: [] },
      action_plan: [
        { window: "الأيام 1–7", title: "تحسين المنتجات", actions: ["راجع الصور والوصف والسعر للمنتجات ذات الطلب الضعيف.", "تأكد من توفر المنتجات المطلوبة قبل العروض."] },
        { window: "الأيام 8–14", title: "اختبار عرض واحد", actions: ["اختبر عرضًا واحدًا وسجل الطلبات قبله وبعده.", "راجع هامش الربح قبل استمرار الخصم."] },
        { window: "الأيام 15–30", title: "قرار المخزون", actions: ["زد مخزون المنتجات التي يستمر طلبها.", "راجع الزيارات والتكلفة قبل إيقاف أي منتج."] },
      ],
    }) as any;
  }

  // PRODUCTS
  if (p === "/products/" && method === "GET") {
    const search = (q.get("search") ?? "").toLowerCase();
    const cat = q.get("category");
    const tag = q.get("tag");
    const brand = q.get("brand");
    let list = q.get("mine") === "true"
      ? PRODUCTS.filter((x) => ACTIVE_USER.role === "admin" || x.seller?.id === ACTIVE_USER.id)
      : PRODUCTS.filter((x) => x.is_approved || (ACTIVE_USER.role === "seller" && x.seller?.id === ACTIVE_USER.id) || ACTIVE_USER.role === "admin");
    if (search)
      list = list.filter(
        (x) =>
          x.name.toLowerCase().includes(search) ||
          (x.brand ?? "").toLowerCase().includes(search) ||
          (x.tags ?? []).some((t) => t.includes(search)),
      );
    if (cat) list = list.filter((x) => x.categories.some((c) => c.slug === cat));
    if (tag) list = list.filter((x) => (x.tags ?? []).includes(tag));
    if (brand) list = list.filter((x) => x.brand === brand);
    const min = Number(q.get("min_price"));
    const max = Number(q.get("max_price"));
    if (q.has("min_price") && Number.isFinite(min))
      list = list.filter((x) => (x.discount_price ?? x.price) >= min);
    if (q.has("max_price") && Number.isFinite(max))
      list = list.filter((x) => (x.discount_price ?? x.price) <= max);
    if (q.get("in_stock") === "true") list = list.filter((x) => x.stock > 0);
    const ordering = q.get("ordering");
    if (ordering) {
      const desc = ordering.startsWith("-");
      const key = desc ? ordering.slice(1) : ordering;
      if (["price", "effective_price", "created_at", "stock", "name"].includes(key))
        list = [...list].sort((a, b) => {
          const result =
            key === "name"
              ? a.name.localeCompare(b.name)
              : key === "created_at"
                ? a.created_at.localeCompare(b.created_at)
                : Number(
                    key === "effective_price"
                      ? (a.discount_price ?? a.price)
                      : (a[key as keyof Product] ?? 0),
                  ) -
                  Number(
                    key === "effective_price"
                      ? (b.discount_price ?? b.price)
                      : (b[key as keyof Product] ?? 0),
                  );
          return desc ? -result : result;
        });
    }
    const count = list.length;
    const pageSize = Math.min(100, Math.max(1, Number(q.get("page_size")) || 24));
    const page = Math.max(1, Number(q.get("page")) || 1);
    list = list.slice((page - 1) * pageSize, page * pageSize);
    return delay({ count, results: list }) as any;
  }
  if (method === "POST" && p === "/products/") {
    if (ACTIVE_USER.role !== "seller") throw new ApiError(403, { detail: "Approved seller access is required." });
    const created: Product = {
      ...(body as any),
      id: PRODUCTS.length + 1,
      slug: (body.name ?? "product").toLowerCase().replace(/\s+/g, "-"),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_approved: false,
      is_featured: false,
      rating_avg: 0,
      rating_count: 0,
      images: body.images ?? [],
      categories: [CATEGORIES.find((c) => c.id === body.category_ids?.[0]) ?? CATEGORIES[0]],
      seller: { id: ACTIVE_USER.id, name: "You" },
    };
    PRODUCTS.push(created);
    return delay(created) as any;
  }

  const slugMatch = p.match(/^\/products\/([^/]+)\/$/);
  if (slugMatch) {
    const slug = slugMatch[1];
    const prod = PRODUCTS.find((x) => x.slug === slug);
    if (!prod) throw new ApiError(404, { detail: "Not found" });
    if (method === "GET") {
      const related = PRODUCTS.filter(
        (x) => x.id !== prod.id && x.categories.some((c) => c.id === prod.categories[0]?.id),
      ).slice(0, 4);
      const reviews = REVIEWS.filter((r) => r.product === prod.id);
      return delay({ ...prod, related, reviews }) as any;
    }
    if (method === "PATCH") {
      if (ACTIVE_USER.role !== "admin" && (ACTIVE_USER.role !== "seller" || prod.seller?.id !== ACTIVE_USER.id)) throw new ApiError(403, { detail: "You cannot edit this listing." });
      if (ACTIVE_USER.role !== "admin") {
        delete (body as any).is_approved;
        delete (body as any).is_featured;
      }
      Object.assign(prod, body);
      return delay(prod) as any;
    }
    if (method === "DELETE") {
      if (ACTIVE_USER.role !== "admin" && (ACTIVE_USER.role !== "seller" || prod.seller?.id !== ACTIVE_USER.id)) throw new ApiError(403, { detail: "You cannot remove this listing." });
      const i = PRODUCTS.findIndex((x) => x.id === prod.id);
      PRODUCTS.splice(i, 1);
      return delay({ detail: "deleted" }) as any;
    }
  }

  // CART is client-side (see stores/cart.ts). Server contract remains documented.
  if (p.startsWith("/cart")) return delay({ items: [] }) as any;

  // ORDERS
  if (p === "/orders/" && method === "GET") return delay(ORDERS) as any;
  if (p === "/orders/" && method === "POST") {
    const items = body.items as { product: Product; qty: number }[];
    const subtotal = items.reduce(
      (s, i) => s + (i.product.discount_price ?? i.product.price) * i.qty,
      0,
    );
    const shipping = subtotal > 500 ? 0 : 25;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const order: Order = {
      id: ORDERS.length + 1001,
      user: ACTIVE_USER.id,
      items: items.map((i) => ({
        product: i.product,
        qty: i.qty,
        price: i.product.discount_price ?? i.product.price,
      })),
      shipping_address: body.shipping_address,
      payment_method: body.payment_method,
      subtotal,
      shipping,
      tax,
      total: subtotal + shipping + tax,
      status: "pending",
      status_history: [{ status: "pending", changed_at: new Date().toISOString() }],
      created_at: new Date().toISOString(),
    };
    ORDERS.unshift(order);
    return delay(order) as any;
  }
  const orderMatch = p.match(/^\/orders\/(\d+)\/$/);
  if (orderMatch && method === "GET") {
    const o = ORDERS.find((x) => x.id === Number(orderMatch[1]));
    if (!o) throw new ApiError(404, { detail: "Not found" });
    return delay(o) as any;
  }

  throw new ApiError(404, { detail: `Mock endpoint not found: ${method} ${p}` });
}
