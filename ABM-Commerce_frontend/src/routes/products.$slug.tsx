import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star, Truck, ShieldCheck, Undo2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { productsApi } from "@/lib/api/services";
import { useCart } from "@/stores/cart";
import { ProductCard } from "@/components/site/product-card";

export const Route = createFileRoute("/products/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productsApi.detail(slug),
  });
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);

  if (!data) return <div className="p-16 text-center">Loading…</div>;
  const price = data.discount_price ?? data.price;
  const gallery = data.images?.length
    ? data.images
    : data.image
      ? [
          {
            id: 0,
            url: `${(import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/api\/?$/, "") || "http://localhost:8000"}${data.image}`,
            alt: data.name,
          },
        ]
      : [];
  return (
    <div className="px-4 py-8 md:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.1fr_1fr]">
        {/* GALLERY */}
        <div className="bento-lg surface-cream-deep relative min-h-[520px] overflow-hidden p-6">
          <div className="grid h-full grid-cols-[80px_1fr] gap-4">
            <div className="flex flex-col gap-2 overflow-y-auto">
              {gallery.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActive(i)}
                  className={`bento aspect-square overflow-hidden border-2 ${
                    active === i ? "border-terracotta" : "border-transparent"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="bento relative overflow-hidden">
              <img
                src={
                  gallery[active]?.url ??
                  "https://placehold.co/900x1000/f1f5f9/334155?text=ABM+Market"
                }
                alt={data.name}
                className="h-full w-full object-cover"
              />
              <span className="text-micro absolute left-4 top-4 rounded-full bg-cream px-3 py-1">
                {data.categories?.[0]?.name}
              </span>
            </div>
          </div>
        </div>

        {/* DETAILS */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="text-micro text-terracotta">{data.brand}</div>
            <h1 className="text-display mt-2 text-4xl md:text-5xl">{data.name}</h1>
            <div className="text-script text-2xl text-ink/60">{data.name_ar}</div>

            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-terracotta text-terracotta" />
                <span className="font-semibold">{data.rating_avg ?? 0}</span>
                <span className="text-ink/50">({data.rating_count ?? 0})</span>
              </div>
              <span className="text-micro rounded-full bg-cream-deep px-3 py-1">
                {data.stock > 0 ? `${data.stock} available` : "Out of stock"}
              </span>
            </div>

            <p className="mt-6 text-base leading-relaxed text-ink/75">{data.description}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {data.tags?.map((t) => (
                <span key={t} className="text-micro rounded-full border border-ink/15 px-3 py-1">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-baseline gap-3">
              <span className="text-display text-5xl">
                {Number(price).toLocaleString("en-EG")} EGP
              </span>
              {data.discount_price && (
                <span className="text-lg text-ink/40 line-through">
                  {Number(data.price).toLocaleString("en-EG")} EGP
                </span>
              )}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-ink/20 px-3 py-2">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-2">
                  −
                </button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-2">
                  +
                </button>
              </div>
              <button
                onClick={() => cart.add(data, qty)}
                className="surface-ink flex-1 rounded-full px-6 py-4 text-sm font-semibold uppercase tracking-widest"
              >
                Add to bag
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-ink/70">
              <Perk icon={<Truck className="h-4 w-4" />} label="Free delivery over 500 EGP" />
              <Perk icon={<ShieldCheck className="h-4 w-4" />} label="Authenticity" />
              <Perk icon={<Undo2 className="h-4 w-4" />} label="Easy returns" />
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <section className="mt-16">
        <h2 className="text-display text-3xl md:text-5xl">
          Reviews
          <span className="text-script text-terracotta ml-2">& replies.</span>
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {(data.reviews ?? []).map((r: any) => (
            <div key={r.id} className="bento surface-cream-deep p-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{r.user.name}</span>
                <span className="text-micro text-terracotta">★ {r.rating}</span>
              </div>
              <div className="text-display mt-2 text-xl">{r.title}</div>
              <p className="mt-2 text-sm text-ink/70">{r.body}</p>
              {r.replies.length > 0 && (
                <div className="mt-3 space-y-2 border-l-2 border-terracotta/40 pl-3">
                  {r.replies.map((rep: any) => (
                    <div key={rep.id} className="text-xs">
                      <span className="font-semibold">{rep.user}: </span>
                      <span className="text-ink/60">{rep.body}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button className="bento surface-cream text-micro flex min-h-[140px] items-center justify-center gap-2 border border-dashed border-ink/25">
            <MessageCircle className="h-4 w-4" /> Write a review
          </button>
        </div>
      </section>

      {/* RELATED */}
      {data.related && data.related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-display text-3xl md:text-5xl">
            Related
            <span className="text-script text-terracotta ml-2">threads.</span>
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Perk({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="bento surface-cream-deep flex items-center gap-2 p-3">
      {icon}
      <span>{label}</span>
    </div>
  );
}
