import { Link } from "@tanstack/react-router";
import { Heart, Plus, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/api/types";
import { useCart } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const { has, toggle } = useWishlist();
  const price = Number(product.discount_price ?? product.price);
  const oldPrice = Number(product.price);
  const discount =
    product.discount_price && oldPrice > 0 ? Math.round((1 - price / oldPrice) * 100) : 0;
  const image = product.image
    ? `${(import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/api\/?$/, "") || "http://localhost:8000"}${product.image}`
    : product.images?.[0]?.url || "https://placehold.co/600x700/f1f5f9/334155?text=ABM+Market";
  const saved = has(product.id);

  return (
    <article className="market-product-card">
      <div className="market-product-image-wrap">
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          aria-label={`View ${product.name}`}
        >
          <img src={image} alt={product.name} loading="lazy" className="market-product-image" />
        </Link>
        {discount > 0 && <span className="market-discount-badge">-{discount}%</span>}
        <button
          onClick={() => toggle(product)}
          aria-label={saved ? "Remove from saved items" : "Save item"}
          className={`market-save ${saved ? "is-saved" : ""}`}
        >
          <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="market-product-brand">
          {product.brand || product.categories[0]?.name || "ABM Market"}
        </p>
        <Link to="/products/$slug" params={{ slug: product.slug }} className="market-product-name">
          {product.name}
        </Link>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <b>{Number(product.rating_avg ?? 4.5).toFixed(1)}</b>
          <span>({product.rating_count ?? 0})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <strong className="text-lg font-extrabold text-slate-950 sm:text-xl">
            {price.toLocaleString("en-EG", {
              style: "currency",
              currency: "EGP",
              maximumFractionDigits: 0,
            })}
          </strong>
          {discount > 0 && (
            <del className="text-xs text-slate-400">
              {oldPrice.toLocaleString("en-EG", {
                style: "currency",
                currency: "EGP",
                maximumFractionDigits: 0,
              })}
            </del>
          )}
        </div>
        <div className="mt-auto pt-3">
          <p className="mb-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <Truck className="h-3.5 w-3.5" /> Delivery available
          </p>
          <button
            onClick={() => {
              cart.add(product);
              toast.success("Added to your bag");
            }}
            disabled={product.stock < 1}
            className="market-add-button"
          >
            <Plus className="h-4 w-4" /> Add to bag
          </button>
        </div>
      </div>
    </article>
  );
}
