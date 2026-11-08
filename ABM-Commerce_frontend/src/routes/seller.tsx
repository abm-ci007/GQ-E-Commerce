import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, BarChart3, Box,
  CircleHelp, Clock3, PackageCheck, Plus, ShieldCheck, Sparkles, Store,
  TriangleAlert, Truck,
} from "lucide-react";
import { productsApi, categoriesApi, sellerApi } from "@/lib/api/services";
import { useAuth } from "@/stores/auth";
import type { Product, SellerApplication, SellerProductAction } from "@/lib/api/types";

export const Route = createFileRoute("/seller")({ component: SellerPage });

const money = (value: number) =>
  new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(value);

function SellerPage() {
  const user = useAuth((state) => state.user);
  const refreshMe = useAuth((state) => state.refreshMe);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const applicationQuery = useQuery({
    queryKey: ["seller-application"],
    queryFn: sellerApi.application,
    enabled: Boolean(user),
  });
  const application = applicationQuery.data?.application ?? null;
  const approved = user?.role === "seller" || application?.status === "approved";

  useEffect(() => {
    if (application?.status === "approved" && user?.role !== "seller") void refreshMe();
  }, [application?.status, user?.role, refreshMe]);

  const dashboardQuery = useQuery({
    queryKey: ["seller-dashboard"],
    queryFn: sellerApi.dashboard,
    enabled: Boolean(user && approved),
    refetchInterval: 60_000,
  });
  const productQuery = useQuery({
    queryKey: ["seller-products", user?.id],
    queryFn: () => productsApi.list({ mine: "true", page_size: "100" }),
    enabled: Boolean(user && approved),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
    enabled: Boolean(user && approved),
  });

  if (!user) return <SellerWelcome />;
  if (!approved) {
    if (application?.status === "pending") return <ApplicationPending application={application} />;
    return (
      <ApplicationForm
        application={application?.status === "rejected" ? application : null}
        onSubmitted={async () => {
          await applicationQuery.refetch();
          toast.success("Your seller application was submitted for review.");
        }}
      />
    );
  }

  const dashboard = dashboardQuery.data;
  const products = productQuery.data?.results ?? [];
  const categoryList = categoriesQuery.data ?? [];
  const trend = dashboard && dashboard.previous_revenue > 0
    ? Math.round(((dashboard.revenue - dashboard.previous_revenue) / dashboard.previous_revenue) * 100)
    : null;

  async function refreshDashboard() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["seller-products"] }),
      queryClient.invalidateQueries({ queryKey: ["products"] }),
    ]);
  }

  return (
    <main className="seller-workspace mx-auto max-w-[1440px] px-4 py-8 md:px-8 md:py-12">
      <header className="seller-welcome-panel">
        <div>
          <div className="seller-eyebrow"><BadgeCheck /> ABM SELLER STUDIO</div>
          <h1>Make your<br /><em>business bloom.</em></h1>
          <p>Good morning, {user.first_name || "seller"}. Your next customer is out there.</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="seller-primary-button">
          <Plus /> Add a product
        </button>
        <div className="seller-sunburst" aria-hidden="true"><Sparkles /></div>
      </header>

      <div className="seller-section-intro">
        <div><span>YOUR SHOP, AT A GLANCE</span><h2>Thirty-day pulse</h2></div>
        <span className="seller-live-status"><i /> Updated from your orders</span>
      </div>
      <section className="seller-stat-grid">
        <Metric icon={<BarChart3 />} label="Gross order value" value={money(dashboard?.revenue ?? 0)} note={trend == null ? "Last 30 days" : `${Math.abs(trend)}% ${trend >= 0 ? "up" : "down"} vs previous 30 days`} trend={trend} />
        <Metric icon={<PackageCheck />} label="Orders" value={`${dashboard?.orders ?? 0}`} note={`${dashboard?.units_sold ?? 0} items sold in 30 days`} />
        <Metric icon={<Box />} label="Live products" value={`${dashboard?.live_products ?? 0}`} note={`${dashboard?.pending_products ?? 0} awaiting review`} />
        <Metric icon={<TriangleAlert />} label="Needs attention" value={`${(dashboard?.low_stock_count ?? 0) + (dashboard?.pending_fulfillment ?? 0)}`} note={`${dashboard?.low_stock_count ?? 0} low stock · ${dashboard?.pending_fulfillment ?? 0} orders to prepare`} alert />
      </section>

      <section className="seller-dashboard-grid">
        <div className="seller-panel seller-chart-panel">
          <div className="seller-panel-heading"><div><span>SALES PERFORMANCE</span><h2>Revenue over time</h2></div><span className="seller-period">Last 30 days</span></div>
          {dashboard?.daily_sales?.length ? (
            <div className="seller-chart"><ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.daily_sales} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                <defs><linearGradient id="sellerRevenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7253e6" stopOpacity={0.32} /><stop offset="95%" stopColor="#7253e6" stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid stroke="#ece8f3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(v: string) => v.slice(5)} axisLine={false} tickLine={false} tick={{ fill: "#897f91", fontSize: 11 }} minTickGap={30} />
                <YAxis tickFormatter={(v: number) => `${Math.round(v)}`} axisLine={false} tickLine={false} tick={{ fill: "#897f91", fontSize: 11 }} />
                <Tooltip formatter={(value) => money(Number(value))} labelStyle={{ color: "#342347" }} contentStyle={{ borderRadius: 14, border: "1px solid #eee8f2" }} />
                <Area type="monotone" dataKey="revenue" stroke="#7253e6" strokeWidth={3} fill="url(#sellerRevenueFill)" />
              </AreaChart>
            </ResponsiveContainer></div>
          ) : <div className="seller-chart-empty"><BarChart3 /><strong>Your sales story starts here.</strong><span>Once orders come in, your daily revenue trend will show here.</span></div>}
          <div className="seller-chart-foot"><span>Average order value</span><strong>{money(dashboard?.average_order_value ?? 0)}</strong><span>Previous period {money(dashboard?.previous_revenue ?? 0)}</span></div>
          <small className="seller-revenue-basis">{dashboard?.revenue_basis}</small>
        </div>

        <aside className="seller-panel seller-insights-panel">
          <div className="seller-panel-heading"><div><span>SMART MARKET GUIDE</span><h2>Small moves, more growth</h2></div><Sparkles /></div>
          <p className="seller-insights-caption">Practical suggestions based on your orders, inventory and category activity.</p>
          {dashboard?.insights.length ? <div className="seller-insight-list">
            {dashboard.insights.slice(0, 4).map((insight, index) => (
              <article key={`${insight.kind}-${index}`} className={`seller-insight seller-insight-${insight.priority}`}>
                <span className="seller-insight-icon">{insight.kind === "inventory" ? <TriangleAlert /> : insight.kind === "momentum" ? <ArrowUpRight /> : <Sparkles />}</span>
                <div><strong>{insight.title}</strong><p>{insight.detail}</p></div>
              </article>
            ))}
          </div> : <div className="seller-first-insight"><Sparkles /><strong>Start with one great listing</strong><p>Add clear photos, helpful details and enough stock. Your market guide will surface suggestions as sales data comes in.</p></div>}
          <small className="seller-insights-disclaimer">{dashboard?.insights_method}</small>
        </aside>
      </section>

      <section className="seller-analyst" dir="rtl">
        <div className="seller-analyst-head">
          <div><span>ABM SMART ANALYST · {dashboard?.period_days ?? 30} يومًا</span><h2>{dashboard?.analyst.title ?? "محلل البيع والمنتجات"}</h2><p>{dashboard?.analyst.summary ?? "نحلل سجل الطلبات والمخزون لمساعدتك في ترتيب خطوات النمو."}</p></div>
          <div className="seller-analyst-mark"><Sparkles /></div>
        </div>
        <div className="seller-action-columns">
          <AnalystColumn title="زِد المخزون بحذر" tone="grow" empty="لا توجد إشارة حالية لزيادة المخزون." items={dashboard?.product_actions.increase_stock ?? []} onEdit={(item) => { const match = products.find((product) => product.id === item.id); if (match) { setEditing(match); setOpen(true); } }} />
          <AnalystColumn title="منتجات تحتاج تحسينًا" tone="improve" empty="لا توجد منتجات ضمن هذه الفئة حاليًا." items={dashboard?.product_actions.improve ?? []} onEdit={(item) => { const match = products.find((product) => product.id === item.id); if (match) { setEditing(match); setOpen(true); } }} />
          <AnalystColumn title="مرشحة لمراجعة الإيقاف" tone="pause" empty="لا توجد منتجات مرشحة للمراجعة." items={dashboard?.product_actions.pause_candidates ?? []} onEdit={(item) => { const match = products.find((product) => product.id === item.id); if (match) { setEditing(match); setOpen(true); } }} />
        </div>
        <div className="seller-action-plan">
          <div className="seller-plan-title"><span>خارطة تنفيذ عملية</span><h3>خطة العمل · 30 يومًا</h3></div>
          {(dashboard?.action_plan ?? []).map((phase) => <article key={phase.window}><span>{phase.window}</span><h4>{phase.title}</h4><ul>{phase.actions.map((action) => <li key={action}>{action}</li>)}</ul></article>)}
        </div>
        <div className="seller-analyst-foot"><strong>كيف وصلنا للتوصيات؟</strong><span>{(dashboard?.analyst.signals ?? []).join(" · ")}</span><p>{(dashboard?.analyst.limitations ?? []).join(" ")}</p><small>محلل إرشادي شفاف يعتمد على قواعد وإشارات المتجر؛ لا يتنبأ بالربح ولا يوقف أو يحذف المنتجات تلقائيًا.</small></div>
      </section>

      <section className="seller-panel seller-catalog-panel">
        <div className="seller-panel-heading"><div><span>YOUR PRODUCT LINEUP</span><h2>Manage your catalog</h2></div><button className="seller-secondary-button" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> New listing</button></div>
        <div className="seller-catalog-scroll"><table className="seller-catalog"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{products.map((product) => <tr key={product.id}>
            <td><div className="seller-product-cell"><img src={product.images?.[0]?.url || product.image || "https://placehold.co/80x80/f4eaff/342347?text=ABM"} alt="" /><span><strong>{product.name}</strong><small>{product.sku}</small></span></div></td>
            <td>{product.categories[0]?.name ?? "Uncategorized"}</td><td>{money(Number(product.discount_price ?? product.price))}</td>
            <td><span className={product.stock <= 5 ? "seller-stock-low" : ""}>{product.stock}</span></td>
            <td><span className={`seller-product-status ${product.is_approved ? "is-live" : "is-pending"}`}>{product.is_approved ? "Live" : "In review"}</span></td>
            <td><div className="seller-row-actions"><button onClick={() => { setEditing(product); setOpen(true); }}>Edit</button><button onClick={async () => { if (!window.confirm(`Delete ${product.name}?`)) return; try { await productsApi.remove(product.slug); toast.success("Listing deleted"); await refreshDashboard(); } catch (error: any) { toast.error(error.message); } }}>Remove</button></div></td>
          </tr>)}</tbody></table>
          {!products.length && <div className="seller-empty-catalog"><Store /><strong>Your storefront is ready.</strong><span>Add your first product to start building your shop.</span></div>}
        </div>
      </section>

      <div className="seller-help-strip"><ShieldCheck /><span><strong>Your seller account is verified.</strong> Product listings go live after a quick marketplace review.</span><Link to="/account">Account settings <ArrowRight /></Link></div>
      {open && <ProductForm product={editing} categories={categoryList.map(({ id, name }) => ({ id, name }))} onClose={() => setOpen(false)} onSaved={async () => { setOpen(false); await refreshDashboard(); }} />}
    </main>
  );
}

function AnalystColumn({ title, tone, empty, items, onEdit }: { title: string; tone: "grow" | "improve" | "pause"; empty: string; items: SellerProductAction[]; onEdit: (item: SellerProductAction) => void }) {
  return <div className={`seller-action-column is-${tone}`}><h3>{title}<span>{items.length}</span></h3>{items.length ? items.map((item) => <article key={item.id}><div className="seller-action-item-head"><strong>{item.name}</strong><span>{item.units_sold} مبيع · مخزون {item.stock}</span></div><p>{item.reason}</p>{item.suggested_stock != null && <small>مستوى مخزون مقترح للمراجعة: {item.suggested_stock} وحدة</small>}<button onClick={() => onEdit(item)}>مراجعة المنتج <ArrowRight /></button></article>) : <p className="seller-action-empty">{empty}</p>}</div>;
}

function SellerWelcome() {
  return <main className="seller-apply-shell mx-auto max-w-[1120px] px-4 py-10 md:px-8 md:py-16"><section className="seller-apply-hero"><div><span className="seller-eyebrow"><Store /> SELL WITH ABM</span><h1>Your idea<br /><em>deserves a shop.</em></h1><p>Bring your products to a growing community of shoppers. Apply in a few minutes; our team will review your store before you start selling.</p><div className="seller-perk-row"><span><ShieldCheck /> Human-reviewed stores</span><span><BarChart3 /> Clear sales insights</span><span><Truck /> Marketplace support</span></div></div><div className="seller-apply-art"><div className="seller-art-orbit" /><Store /><span>YOUR<br />NEXT<br /><em>CHAPTER</em></span><Sparkles /></div></section><section className="seller-apply-steps"><div><b>01</b><strong>Tell us about your shop</strong><span>Share what you sell and how to reach you.</span></div><ArrowRight /><div><b>02</b><strong>We review your application</strong><span>Our team checks each store for marketplace fit.</span></div><ArrowRight /><div><b>03</b><strong>Start selling</strong><span>Once approved, publish products and track orders.</span></div></section><section className="seller-signin-card"><div><h2>Ready to apply?</h2><p>Sign in to your ABM customer account to begin your seller application.</p></div><div><Link to="/auth/login" className="seller-primary-button">Sign in <ArrowRight /></Link><Link to="/auth/register" className="seller-text-link">Create an account</Link></div></section></main>;
}

function ApplicationForm({ application, onSubmitted }: { application: SellerApplication | null; onSubmitted: () => Promise<void> }) {
  const [form, setForm] = useState({
    store_name: application?.store_name ?? "", business_type: application?.business_type ?? "individual",
    contact_phone: application?.contact_phone ?? "", city: application?.city ?? "",
    website: application?.website ?? "", description: application?.description ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const set = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  return <main className="seller-apply-shell mx-auto max-w-[1120px] px-4 py-10 md:px-8 md:py-14"><div className="seller-application-layout"><aside className="seller-application-aside"><span className="seller-eyebrow"><Store /> ABM SELLER PARTNER</span><h1>Let’s build<br /><em>your next thing.</em></h1><p>Share a little about your business. Approval gives you access to product publishing, order insights and your own seller studio.</p><ol><li><b>1</b><span><strong>Apply</strong><small>Tell us about your store</small></span></li><li><b>2</b><span><strong>Review</strong><small>Our team checks your details</small></span></li><li><b>3</b><span><strong>Launch</strong><small>List products and grow</small></span></li></ol></aside>
    <section className="seller-application-card"><div className="seller-form-heading"><div><span>SELLER ONBOARDING · STEP 1 OF 1</span><h2>Tell us about your store</h2></div><span className="seller-form-badge"><ShieldCheck /> Secure review</span></div>
      {application?.status === "rejected" && <div className="seller-review-note"><CircleHelp /><span><strong>We need a little more information</strong><small>{application.review_note || "Please review your details and resubmit your application."}</small></span></div>}
      <form onSubmit={async (event) => { event.preventDefault(); setSubmitting(true); try { await sellerApi.apply(form); await onSubmitted(); } catch (error: any) { toast.error(error.message); } finally { setSubmitting(false); } }}>
        <label className="seller-field"><span>Store name *</span><input required minLength={2} maxLength={120} value={form.store_name} onChange={(e) => set("store_name", e.target.value)} placeholder="e.g. Sunday House" /></label>
        <label className="seller-field"><span>Business type *</span><select value={form.business_type} onChange={(e) => set("business_type", e.target.value as typeof form.business_type)}><option value="individual">Independent maker / individual</option><option value="registered">Registered business</option><option value="brand">Established brand</option></select></label>
        <div className="seller-field-row"><label className="seller-field"><span>Contact phone *</span><input required minLength={7} value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} placeholder="+20 1X XXX XXXX" /></label><label className="seller-field"><span>City *</span><input required minLength={2} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Cairo" /></label></div>
        <label className="seller-field"><span>Website or social profile <small>Optional</small></span><input type="url" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://instagram.com/yourstore" /></label>
        <label className="seller-field"><span>What do you sell? *</span><textarea required minLength={30} maxLength={1200} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell us about your products, how they're made, and who they're for…" /><small>{form.description.length}/1200 characters · At least 30 characters</small></label>
        <button className="seller-primary-button seller-submit-button" disabled={submitting}>{submitting ? "Submitting…" : application ? "Resubmit application" : "Send for review"}<ArrowRight /></button>
        <p className="seller-privacy-note"><ShieldCheck /> Your details are shared only with the ABM review team.</p>
      </form>
    </section></div></main>;
}

function ApplicationPending({ application }: { application: SellerApplication }) {
  return <main className="seller-apply-shell mx-auto max-w-[960px] px-4 py-12 md:px-8 md:py-20"><section className="seller-pending-card"><div className="seller-pending-icon"><Clock3 /></div><span className="seller-eyebrow">APPLICATION RECEIVED</span><h1>Good things take<br /><em>a little care.</em></h1><p>Thanks for applying to open <strong>{application.store_name}</strong>. The ABM team is reviewing your details. You’ll be able to publish products once your application is approved.</p><div className="seller-pending-progress"><span className="complete"><BadgeCheck /> Submitted</span><i /><span className="active"><Clock3 /> Under review</span><i /><span><Store /> Seller studio</span></div><Link to="/" className="seller-text-link">Back to shopping <ArrowRight /></Link></section></main>;
}

function Metric({ icon, label, value, note, trend, alert = false }: { icon: React.ReactNode; label: string; value: string; note: string; trend?: number | null; alert?: boolean }) {
  const TrendIcon = trend != null && trend < 0 ? ArrowDownRight : ArrowUpRight;
  return <article className={`seller-metric ${alert ? "seller-metric-alert" : ""}`}><span className="seller-metric-icon">{icon}</span><span className="seller-metric-label">{label}</span><strong>{value}</strong><small className={trend == null ? "" : trend < 0 ? "is-down" : "is-up"}>{trend != null && <TrendIcon />}{note}</small></article>;
}

function ProductForm({ product, categories, onClose, onSaved }: { product: Product | null; categories: { id: number; name: string }[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState({
    name: product?.name ?? "", description: product?.description ?? "", price: Number(product?.price ?? 0),
    discount_price: product?.discount_price ? Number(product.discount_price) : "", stock: Number(product?.stock ?? 0),
    category: product?.categories[0]?.id ?? categories[0]?.id ?? 0, brand: product?.brand ?? "",
    tags: product?.tags?.join(", ") ?? "", image_url: product?.images?.[0]?.url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [suggestion, setSuggestion] = useState<{ name: string; description: string } | null>(null);
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number } | null>(null);
  const set = (field: keyof typeof form, value: string | number) => setForm((current) => ({ ...current, [field]: value }));
  const imageFeedback = imageInfo
    ? imageInfo.width < 800 || imageInfo.height < 800
      ? `الدقة ${imageInfo.width}×${imageInfo.height} منخفضة نسبيًا؛ استخدم صورة أوضح لا تقل عن 800×800 بكسل.`
      : imageInfo.width / imageInfo.height < 0.85 || imageInfo.width / imageInfo.height > 1.18
        ? `الصورة ${imageInfo.width}×${imageInfo.height} واضحة، لكن قصّها بنسبة قريبة من 1:1 يساعد على ظهور المنتج كاملًا في بطاقات المتجر.`
        : `الصورة ${imageInfo.width}×${imageInfo.height} مناسبة تقنيًا للعرض المربع. اختر خلفية هادئة وإضاءة واضحة واترك مساحة حول المنتج.`
    : "أدخل رابط صورة صالحًا لمراجعة أبعادها ونسبة العرض. هذه مراجعة تقنية للصورة وليست تعرفًا بصريًا على محتواها.";
  function suggestCopy() {
    const cleanName = form.name.trim().replace(/\s+/g, " ");
    const cleanDescription = form.description.trim().replace(/\s+/g, " ");
    if (!cleanName || !cleanDescription) { toast.error("أدخل اسم المنتج ووصفًا أوليًا قبل إنشاء الاقتراح."); return; }
    const name = form.brand.trim() && !cleanName.toLowerCase().includes(form.brand.trim().toLowerCase())
      ? `${form.brand.trim()} ${cleanName}` : cleanName;
    const description = `${cleanDescription}\n\n${categories.find((category) => category.id === form.category)?.name ? `الفئة: ${categories.find((category) => category.id === form.category)?.name}. ` : ""}راجع تفاصيل المنتج واختر الكمية المناسبة قبل إضافته إلى سلتك.`;
    setSuggestion({ name, description });
  }
  return <div className="seller-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="seller-product-modal" role="dialog" aria-modal="true" aria-labelledby="seller-product-title"><div className="seller-form-heading"><div><span>YOUR CATALOG</span><h2 id="seller-product-title">{product ? "Edit listing" : "Create a listing"}</h2></div><button className="seller-modal-close" onClick={onClose} aria-label="Close">×</button></div>
    <form onSubmit={async (event) => { event.preventDefault(); setSaving(true); try {
      const payload = { ...form, slug: product?.slug ?? `${form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`, sku: product?.sku ?? `ABM-${Date.now()}`, category_ids: form.category ? [form.category] : [], discount_price: form.discount_price === "" ? null : Number(form.discount_price), tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
      if (product) await productsApi.update(product.slug, payload as any); else await productsApi.create(payload as any);
      toast.success(product ? "Listing updated" : "Listing sent for review"); await onSaved();
    } catch (error: any) { toast.error(error.message); } finally { setSaving(false); } }}>
      <div className="seller-product-form-grid"><Field label="Product name *"><input required minLength={2} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field><Field label="Brand"><input value={form.brand} onChange={(e) => set("brand", e.target.value)} /></Field><Field label="Category *"><select required value={form.category} onChange={(e) => set("category", Number(e.target.value))}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field><Field label="Stock *"><input required type="number" min={0} value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} /></Field><Field label="Price (EGP) *"><input required type="number" min={1} step="0.01" value={form.price} onChange={(e) => set("price", Number(e.target.value))} /></Field><Field label="Offer price (EGP)"><input type="number" min={0} step="0.01" value={form.discount_price} onChange={(e) => set("discount_price", e.target.value === "" ? "" : Number(e.target.value))} /></Field><Field label="Product image URL" wide><input type="url" value={form.image_url} onChange={(e) => { set("image_url", e.target.value); setImageInfo(null); }} placeholder="https://…" /></Field>{form.image_url && <div className="seller-image-review seller-field-wide"><img src={form.image_url} alt="معاينة صورة المنتج" onLoad={(event) => setImageInfo({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} onError={() => setImageInfo(null)} /><div><strong>مراجعة صورة المنتج</strong><p>{imageFeedback}</p><small>لأفضل فرصة عرض: صورة أصلية للمنتج، خلفية بسيطة، وإضاءة متوازنة.</small></div></div>}<Field label="Tags · comma separated" wide><input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="handmade, gift, cotton" /></Field><Field label="Product story *" wide><textarea required minLength={10} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field></div>
      <section className="seller-copy-assistant" dir="rtl"><div><Sparkles /><span><strong>مساعد تحسين صفحة المنتج</strong><small>يرتب المعلومات التي أدخلتها ويضيف دعوة شراء عامة دون اختلاق مواصفات.</small></span><button type="button" onClick={suggestCopy}>اقتراح عنوان ووصف</button></div>{suggestion && <div className="seller-copy-suggestion"><Field label="عنوان مقترح"><input value={suggestion.name} onChange={(e) => setSuggestion({ ...suggestion, name: e.target.value })} /></Field><Field label="وصف مقترح" wide><textarea rows={4} value={suggestion.description} onChange={(e) => setSuggestion({ ...suggestion, description: e.target.value })} /></Field><button type="button" className="seller-secondary-button" onClick={() => { set("name", suggestion.name); set("description", suggestion.description); setSuggestion(null); }}>استخدام الاقتراح</button></div>}<small className="seller-copy-disclaimer">مساعد محلي مبني على قواعد صياغة؛ لا يتصل بنموذج ذكاء اصطناعي خارجي حاليًا. مراجعة الصورة تقيس الأبعاد فقط ولا تعدّل ملف الصورة.</small></section>
      <div className="seller-modal-actions"><button type="button" className="seller-secondary-button" onClick={onClose}>Cancel</button><button disabled={saving} className="seller-primary-button">{saving ? "Saving…" : product ? "Save changes" : "Send for review"}<ArrowRight /></button></div>
    </form></section></div>;
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`seller-field ${wide ? "seller-field-wide" : ""}`}><span>{label}</span>{children}</label>;
}
