import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/site/product-card";
import { useWishlist } from "@/stores/wishlist";

export const Route = createFileRoute("/account/wishlist")({ component: WishlistPage });

function WishlistPage() {
  const items = useWishlist((state) => state.items);
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="market-kicker">Your shortlist</p>
          <h1 className="market-heading">
            Saved items{" "}
            <span className="text-base font-medium text-slate-500">({items.length})</span>
          </h1>
        </div>
      </div>
      {items.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="market-empty flex flex-col items-center">
          <Heart className="mb-3 h-9 w-9 text-blue-700" />
          <h2 className="font-bold text-slate-900">Your saved list is empty</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tap the heart on anything you like to find it here.
          </p>
          <Link to="/shop" className="market-button-yellow mt-5">
            Explore the shop
          </Link>
        </div>
      )}
    </div>
  );
}
