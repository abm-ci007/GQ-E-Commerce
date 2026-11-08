import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { productsApi, categoriesApi } from "@/lib/api/services";
import { sellerApi } from "@/lib/api/services";
import { useAuth } from "@/stores/auth";
import { toast } from "sonner";
import { Check, X, Star, Store, Clock3, BadgeCheck, FileText } from "lucide-react";
import type { SellerApplication } from "@/lib/api/types";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const TABS = ["Overview", "Products", "Seller applications", "Categories", "Users"] as const;

function AdminPage() {
  const qc = useQueryClient();
  const user = useAuth((state) => state.user);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const { data } = useQuery({ queryKey: ["products"], queryFn: () => productsApi.list() });
  const { data: cats } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const applicationsQuery = useQuery({
    queryKey: ["admin-seller-applications"],
    queryFn: () => sellerApi.applications("pending"),
    enabled: tab === "Seller applications" && user?.role === "admin",
  });
  const categoryList = Array.isArray(cats) ? cats : [];
  const products = data?.results ?? [];

  async function toggle(slug: string, patch: any) {
    await productsApi.update(slug, patch);
    qc.invalidateQueries({ queryKey: ["products"] });
    toast.success("Updated");
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <header className="bento-lg surface-terracotta p-8 text-cream md:p-12">
        <div className="text-micro">Global CMS</div>
        <h1 className="text-display mt-2 text-5xl md:text-7xl">
          Admin
          <span className="text-script text-cream/80 ml-2">panel.</span>
        </h1>
        <p className="mt-4 max-w-md text-cream/85">Approve products, feature pieces, manage the ledger.</p>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-micro rounded-full px-4 py-2 ${tab === t ? "surface-ink" : "border border-ink/20"}`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === "Overview" && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Stat label="Total products" value={products.length.toString()} />
          <Stat label="Pending approval" value={products.filter((p) => !p.is_approved).length.toString()} />
          <Stat label="Featured" value={products.filter((p) => p.is_featured).length.toString()} />
          <Stat label="Categories" value={categoryList.length.toString()} />
        </div>
      )}

      {tab === "Products" && (
        <section className="bento-lg surface-cream-deep mt-6 p-6">
          <h2 className="text-display text-3xl">All products</h2>
          <ul className="mt-4 divide-y divide-ink/10">
            {products.map((p) => (
              <li key={p.id} className="flex flex-col items-start justify-between gap-3 py-4 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <img src={p.images?.[0]?.url} className="h-12 w-12 rounded-xl object-cover" alt="" />
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-micro text-ink/50">{p.seller?.name ?? "ABM"} ? {p.categories[0]?.name ?? "Uncategorized"}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => toggle(p.slug, { is_approved: !p.is_approved })}
                    className={`text-micro inline-flex items-center gap-1 rounded-full px-3 py-1 ${p.is_approved ? "surface-terracotta" : "border border-ink/20"}`}
                  >
                    {p.is_approved ? <><Check className="h-3 w-3" /> Approved</> : <><X className="h-3 w-3" /> Reject</>}
                  </button>
                  <button
                    onClick={() => toggle(p.slug, { is_featured: !p.is_featured })}
                    className={`text-micro inline-flex items-center gap-1 rounded-full px-3 py-1 ${p.is_featured ? "surface-ink" : "border border-ink/20"}`}
                  >
                    <Star className={`h-3 w-3 ${p.is_featured ? "fill-terracotta text-terracotta" : ""}`} />
                    {p.is_featured ? "Featured" : "Feature"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "Seller applications" && (
        <section className="admin-seller-applications mt-6">
          <div className="admin-seller-heading"><div><span>MARKETPLACE TRUST</span><h2>Seller applications</h2><p>Review each store before granting seller access.</p></div><span className="admin-pending-count"><Clock3 /> {applicationsQuery.data?.length ?? 0} waiting</span></div>
          {user?.role !== "admin" ? (
            <div className="bento surface-cream-deep mt-5 p-6">Administrator access is required to review seller applications.</div>
          ) : applicationsQuery.isLoading ? (
            <div className="bento surface-cream-deep mt-5 p-6">Loading applications…</div>
          ) : applicationsQuery.data?.length ? (
            <div className="admin-application-grid">{applicationsQuery.data.map((application) => <SellerApplicationCard key={application.id} application={application} onReviewed={async () => { await qc.invalidateQueries({ queryKey: ["admin-seller-applications"] }); toast.success("Application decision saved"); }} />)}</div>
          ) : (
            <div className="admin-applications-empty"><BadgeCheck /><strong>All caught up.</strong><span>New seller applications will appear here.</span></div>
          )}
        </section>
      )}

      {tab === "Categories" && (
        <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {categoryList.map((c) => (
            <div key={c.id} className="bento surface-cream-deep p-5">
              <div className="text-micro text-ink/50">{c.slug}</div>
              <div className="text-display text-2xl">{c.name}</div>
              <div className="text-script text-ink/60">{c.name_ar}</div>
            </div>
          ))}
        </section>
      )}

      {tab === "Users" && (
        <section className="bento-lg surface-cream-deep mt-6 p-6">
          <p className="text-sm text-ink/70">User management panel wired to <code>/auth/me/</code> and admin endpoints — full table appears once your Django backend is connected.</p>
        </section>
      )}
    </div>
  );
}

function SellerApplicationCard({ application, onReviewed }: { application: SellerApplication; onReviewed: () => Promise<void> }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  async function review(status: "approved" | "rejected") {
    if (status === "rejected" && note.trim().length < 5) {
      toast.error("Add a note to explain what needs to change.");
      return;
    }
    setBusy(true);
    try { await sellerApi.review(application.id, status, note); await onReviewed(); }
    catch (error: any) { toast.error(error.message); }
    finally { setBusy(false); }
  }
  return <article className="admin-application-card"><div className="admin-application-card-top"><span className="admin-application-icon"><Store /></span><span className="seller-product-status is-pending">Awaiting review</span></div><h3>{application.store_name}</h3><p className="admin-application-owner">{application.applicant_name} · {application.applicant_email}</p><div className="admin-application-facts"><span>{application.business_type.replaceAll("_", " ")}</span><span>{application.city}</span><span>{application.contact_phone}</span>{application.website && <a href={application.website} target="_blank" rel="noreferrer">Visit website ↗</a>}</div><div className="admin-application-description"><FileText /><p>{application.description}</p></div><label className="seller-field"><span>Decision note <small>Required when requesting changes</small></span><textarea rows={3} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Share clear next steps if more information is needed…" /></label><div className="admin-application-actions"><button disabled={busy} onClick={() => void review("rejected")} className="admin-request-changes"><X /> Request changes</button><button disabled={busy} onClick={() => void review("approved")} className="admin-approve"><Check /> Approve seller</button></div></article>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bento surface-cream-deep p-6">
      <div className="text-micro text-ink/60">{label}</div>
      <div className="text-display mt-2 text-4xl">{value}</div>
    </div>
  );
}
